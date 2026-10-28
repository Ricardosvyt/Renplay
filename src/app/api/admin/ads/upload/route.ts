import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createPresignedUploadUrl } from "@/lib/cloud-storage";
import { requireAdvertisingAdmin } from "@/lib/advertising";
const TYPES:Record<string,string>={"image/webp":"webp","image/png":"png","image/jpeg":"jpg"};
export async function POST(request:Request){const auth=await requireAdvertisingAdmin(request);if(auth.response)return auth.response;const body=await request.json().catch(()=>({})) as {contentType?:string;sizeBytes?:number},extension=TYPES[String(body.contentType||"").toLowerCase()],size=Number(body.sizeBytes);if(!extension||!Number.isInteger(size)||size<1||size>5*1024*1024)return NextResponse.json({error:"Use WebP, PNG ou JPEG com até 5 MB."},{status:400});const objectKey=`advertising/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`,uploadUrl=await createPresignedUploadUrl(objectKey,size,180);return NextResponse.json({objectKey,uploadUrl,expiresInSeconds:180});}
