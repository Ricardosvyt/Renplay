import { NextResponse } from "next/server";
import { getBearerUser } from "@/lib/auth";
import { createPresignedDownloadUrl } from "@/lib/cloud-storage";
import { getDb } from "@/lib/db";
import { DEFAULT_AD_SETTINGS,normalizeSettings,sessionHash } from "@/lib/advertising";

type Row={id:string;creative_id:string;title:string;description:string;image_url:string|null;image_object_key:string|null;destination_url:string;creative_type:string;placement:string;frequency_cap:number|null;targeting:{countries?:string[];languages?:string[];ageRatings?:string[];devices?:string[]};impressions:number;clicks:number;session_events:number};
export async function GET(request:Request){
  const url=new URL(request.url),platform=url.pathname.includes("/site/")?"site":"launcher",placement=(url.searchParams.get("placement")||"").trim(),locale=(url.searchParams.get("locale")||"").toLowerCase(),country=(url.searchParams.get("country")||"").toUpperCase(),age=(url.searchParams.get("age")||"").trim(),rawSession=(url.searchParams.get("session")||"").trim();
  if(!/^[a-z_]{3,40}$/.test(placement))return NextResponse.json({ads:[],refreshAfterSeconds:300});
  const db=getDb(),setting=await db.query<{value:unknown}>("SELECT value FROM rp_settings WHERE key='advertising'"),settings=normalizeSettings(setting.rows[0]?.value||DEFAULT_AD_SETTINGS);
  if(!settings.enabled||(platform==="launcher"?!settings.launcherEnabled:!settings.siteEnabled))return NextResponse.json({ads:[],refreshAfterSeconds:settings.refreshSeconds});
  const user=await getBearerUser(request).catch(()=>null),vip=Boolean(user?.roles?.some(role=>["VIP","ADMIN"].includes(role))),session=(()=>{try{return sessionHash(rawSession);}catch{return "anonymous";}})();
  if(vip&&settings.vipBehavior==="hide_all")return NextResponse.json({ads:[],refreshAfterSeconds:settings.refreshSeconds});
  const result=await db.query<Row>(`SELECT c.id,cr.id creative_id,cr.title,cr.description,cr.image_url,cr.image_object_key,cr.destination_url,cr.creative_type,p.code placement,c.frequency_cap,c.targeting,
    count(e.id) FILTER(WHERE e.event_type='IMPRESSION')::int impressions,count(e.id) FILTER(WHERE e.event_type='CLICK')::int clicks,
    count(e.id) FILTER(WHERE e.anonymous_session_id=$2 AND e.event_time>now()-interval '24 hours')::int session_events
    FROM rp_ad_campaigns c JOIN rp_ad_creatives cr ON cr.campaign_id=c.id JOIN rp_ad_campaign_placements cp ON cp.campaign_id=c.id JOIN rp_ad_placements p ON p.id=cp.placement_id LEFT JOIN rp_ad_events e ON e.campaign_id=c.id
    WHERE p.code=$1 AND p.enabled=true AND (c.status='ACTIVE' OR (c.status='SCHEDULED' AND c.starts_at IS NOT NULL AND c.starts_at<=now())) AND (c.starts_at IS NULL OR c.starts_at<=now()) AND (c.ends_at IS NULL OR c.ends_at>now())
    GROUP BY c.id,cr.id,p.code HAVING (c.impression_limit IS NULL OR count(e.id) FILTER(WHERE e.event_type='IMPRESSION')<c.impression_limit) AND (c.click_limit IS NULL OR count(e.id) FILTER(WHERE e.event_type='CLICK')<c.click_limit)
    ORDER BY c.priority DESC,c.updated_at DESC LIMIT 25`,[placement,session]);
  const eligible=result.rows.filter(row=>{const t=row.targeting||{},matches=(items:string[]|undefined,value:string)=>!items?.length||Boolean(value&&items.map(String).some(item=>item.toLowerCase()===value.toLowerCase()||value.toLowerCase().startsWith(item.toLowerCase()+"-")));if(vip&&settings.vipBehavior==="internal_only"&&row.creative_type==="EXTERNAL_PARTNER")return false;if(!settings.internalCampaignsEnabled&&row.creative_type==="INTERNAL_PROMO")return false;if(row.frequency_cap&&row.session_events>=row.frequency_cap)return false;return matches(t.languages,locale)&&matches(t.countries,country)&&matches(t.ageRatings,age)&&matches(t.devices,platform);}).slice(0,settings.maxPerPlacement);
  const ads=await Promise.all(eligible.map(async row=>({id:row.id,creativeId:row.creative_id,title:row.title,description:row.description,imageUrl:row.image_object_key?await createPresignedDownloadUrl(row.image_object_key,settings.refreshSeconds+120):row.image_url,destinationUrl:row.destination_url,placement:row.placement,type:row.creative_type.toLowerCase(),sponsored:true})));
  return NextResponse.json({ads,refreshAfterSeconds:settings.refreshSeconds},{headers:{"Cache-Control":`private, max-age=${Math.min(settings.refreshSeconds,300)}`,"X-Content-Type-Options":"nosniff"}});
}
