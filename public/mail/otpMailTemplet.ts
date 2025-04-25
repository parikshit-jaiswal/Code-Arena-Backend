export const html = (otp) = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Code Arena - Your OTP</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: #0D1439;
      font-size: 14px;
      color: #E6E7EB;
    "
  >
    <div
      style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: #0D1439;
        font-size: 14px;
        color: #E6E7EB;
      "
    >
      <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="height: 0;">
              <td>
                <div style="font-size: 26px; font-weight: 700; color: #FFFFFF;">
                  <span style="color: #61DAFB;">CODE</span> ARENA
                </div>
              </td>
              <td style="text-align: right;">
                <span
                  style="font-size: 16px; line-height: 30px; color: #8A91B4;"
                  ></span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <div
          style="
            margin: 0;
            margin-top: 50px;
            padding: 50px 30px;
            background: #131C4D;
            border-radius: 16px;
            text-align: center;
            border: 1px solid #252D5A;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto;">
            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(97, 218, 251, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 32px; color: #61DAFB;">🔐</div>
            </div>
            
            <h1
              style="
                margin: 0;
                margin-top: 25px;
                font-size: 24px;
                font-weight: 700;
                color: #FFFFFF;
              "
            >
              Verification Code
            </h1>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 16px;
                font-weight: 500;
                color: #8A91B4;
              "
            >
              Hello Developer,
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 400;
                line-height: 1.6;
                color: #B0B7D9;
              "
            >
              Thank you for choosing <span style="font-weight: 600; color: #FFFFFF;">Code Arena</span>. 
              Use the following verification code to complete your email address change. 
              This code is valid for <span style="font-weight: 600; color: #61DAFB;">5 minutes</span> only.
            </p>
            <div
              style="
                margin: 40px auto;
                padding: 20px;
                background: #0D1439;
                border-radius: 10px;
                border: 1px dashed #3D4673;
              "
            >
              <p
                style="
                  margin: 0;
                  font-size: 38px;
                  font-weight: 700;
                  letter-spacing: 10px;
                  color: #61DAFB;
                  font-family: monospace;
                "
              >
                ${otp}
              </p>
            </div>
            <p style="color: #8A91B4; font-size: 13px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 40px;
            text-align: center;
            font-weight: 400;
            color: #8A91B4;
          "
        >
          Need help? Contact us at
          <a
            href="mailto:support@codearena.dev"
            style="color: #61DAFB; text-decoration: none; font-weight: 500;"
            >support@codearena.dev</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #61DAFB; text-decoration: none; font-weight: 500;"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 30px auto 0;
          text-align: center;
          border-top: 1px solid #252D5A;
          padding-top: 30px;
        "
      >
        <p
          style="
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
          "
        >
          Code Arena
        </p>
        <p style="margin: 0; margin-top: 8px; color: #8A91B4; font-size: 13px;">
          123 Dev Street, Tech City, CA 94107
        </p>
        <div style="margin: 20px 0;">
          <a href="" target="_blank" style="display: inline-block; margin: 0 8px;">
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: #1E2755;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #61DAFB;
              font-size: 16px;
              text-decoration: none;
            ">
              <span>f</span>
            </div>
          </a>
          <a href="" target="_blank" style="display: inline-block; margin: 0 8px;">
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: #1E2755;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #61DAFB;
              font-size: 16px;
              text-decoration: none;
            ">
              <span>in</span>
            </div>
          </a>
          <a href="" target="_blank" style="display: inline-block; margin: 0 8px;">
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: #1E2755;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #61DAFB;
              font-size: 16px;
              text-decoration: none;
            ">
              <span>X</span>
            </div>
          </a>
          <a href="" target="_blank" style="display: inline-block; margin: 0 8px;">
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: #1E2755;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #61DAFB;
              font-size: 16px;
              text-decoration: none;
            ">
              <span>gh</span>
            </div>
          </a>
        </div>
        <p style="margin: 0; margin-top: 16px; color: #8A91B4; font-size: 12px;">
          © 2025 Code Arena. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>`