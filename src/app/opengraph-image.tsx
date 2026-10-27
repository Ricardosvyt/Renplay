import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const alt = "RenPlay — Sua próxima história começa aqui";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let logoSrc = "";

  try {
    const logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "Logo.png"));
    logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Erro ao carregar Logo.png:", err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0A0B0E",
          backgroundImage:
            "radial-gradient(circle at 50% 40%, rgba(255, 222, 0, 0.16) 0%, transparent 65%), radial-gradient(circle at 10% 90%, rgba(255, 222, 0, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(255, 222, 0, 0.05) 0%, transparent 40%)",
          padding: "50px 60px",
          position: "relative",
          fontFamily: "sans-serif",
          color: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        {/* Linha de borda superior dourada com brilho */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #FFAE00, #FFDE00, #FFAE00)",
            display: "flex",
          }}
        />

        {/* Topo: Badge de Categoria */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 24px",
            borderRadius: "30px",
            backgroundColor: "rgba(255, 222, 0, 0.12)",
            border: "1px solid rgba(255, 222, 0, 0.35)",
            fontSize: "13px",
            fontWeight: 800,
            color: "#FFDE00",
            letterSpacing: "2px",
          }}
        >
          <span>LAUNCHER OFICIAL DE VISUAL NOVELS</span>
        </div>

        {/* Centro: LOGO OFICIAL EM DESTAQUE MÁXIMO */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            marginTop: "10px",
          }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="RenPlay"
              width="580"
              height="194"
              style={{
                width: "580px",
                height: "194px",
                objectFit: "contain",
                display: "flex",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: "76px",
                fontWeight: 900,
                letterSpacing: "-2px",
                display: "flex",
              }}
            >
              <span>REN</span>
              <span style={{ color: "#FFDE00" }}>PLAY</span>
            </div>
          )}

          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#F5F3ED",
              letterSpacing: "-0.5px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>Suas histórias.</span>
            <span>Seu universo.</span>
            <span style={{ color: "#FFDE00" }}>Seu RenPlay.</span>
          </div>

          <div
            style={{
              fontSize: "19px",
              color: "#A1A1AA",
              textAlign: "center",
              maxWidth: "820px",
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            Descubra jogos e visual novels, organize sua biblioteca e jogue no PC e Android com sincronização de saves na nuvem.
          </div>
        </div>

        {/* Rodapé: Recursos e Domínio Oficial */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#E4E4E7",
              }}
            >
              Runtimes Ren&apos;Py 7 & 8
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#E4E4E7",
              }}
            >
              Saves Locais e Nuvem
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#E4E4E7",
              }}
            >
              Windows & Android
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "20px",
              backgroundColor: "rgba(255, 222, 0, 0.12)",
              border: "1px solid rgba(255, 222, 0, 0.35)",
              fontSize: "15px",
              fontWeight: 800,
              color: "#FFDE00",
            }}
          >
            renplay.site
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
