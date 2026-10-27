import { ImageResponse } from "next/og";

export const alt = "RenPlay — Sua próxima história começa aqui";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0C0D0F",
          backgroundImage:
            "radial-gradient(circle at 80% 30%, rgba(255, 222, 0, 0.15) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(255, 222, 0, 0.08) 0%, transparent 50%)",
          padding: "60px 70px",
          position: "relative",
          fontFamily: "sans-serif",
          color: "#FFFFFF",
        }}
      >
        {/* Linha dourada superior */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #FFDE00, #FFAE00)",
          }}
        />

        {/* Topo / Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Ícone estilizado RenPlay */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#FFDE00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0C0D0F",
                fontSize: "26px",
                fontWeight: 900,
                boxShadow: "0 0 25px rgba(255, 222, 0, 0.5)",
              }}
            >
              ▶
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "36px",
                fontWeight: 900,
                letterSpacing: "-1px",
                color: "#FFFFFF",
              }}
            >
              <span>REN</span>
              <span style={{ color: "#FFDE00" }}>PLAY</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 20px",
              borderRadius: "30px",
              backgroundColor: "rgba(255, 222, 0, 0.12)",
              border: "1px solid rgba(255, 222, 0, 0.35)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#FFDE00",
              letterSpacing: "1px",
            }}
          >
            LAUNCHER OFICIAL
          </div>
        </div>

        {/* Centro / Título e Descrição */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "880px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "62px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-2px",
              color: "#FFFFFF",
            }}
          >
            <span>Suas histórias. Seu universo.</span>
            <span style={{ color: "#FFDE00" }}>Seu RenPlay.</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "22px",
              lineHeight: 1.5,
              color: "#A1A1AA",
              fontWeight: 400,
            }}
          >
            Descubra visual novels, organize sua biblioteca e aproveite o launcher oficial para Windows, Linux, macOS e Android com saves na nuvem.
          </div>
        </div>

        {/* Rodapé / Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
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
                fontSize: "15px",
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
                fontSize: "15px",
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
                fontSize: "15px",
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
              fontSize: "16px",
              fontWeight: 700,
              color: "#71717A",
            }}
          >
            renplay.com.br
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
