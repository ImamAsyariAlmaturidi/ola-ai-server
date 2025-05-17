import sgMail from "@sendgrid/mail";
const imageUrl = "http://localhost:3000/public/assets/socialMediaFan.png";
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerifyCode(
  email: string,
  code: string
): Promise<void> {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
  <xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#f7f7f7;">
  <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f7f7f7;">
    <table role="presentation" style="width:100%;border:none;border-spacing:0;">
      <tr>
        <td align="center" style="padding:0;">
          <!--[if mso]>
          <table role="presentation" align="center" style="width:600px;">
          <tr>
          <td>
          <![endif]-->
          <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
            <!-- Logo/Header -->
            <tr>
              <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;">
                <a href="https://olaai.space" style="text-decoration:none;">
                  <img src=${imageUrl} width="150" alt="Logo" style="width:150px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;">
                </a>
              </td>
            </tr>
            <!-- Main Content Area -->
            <tr>
              <td style="padding:30px;background-color:#ffffff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="margin-top:0;margin-bottom:16px;font-size:26px;line-height:32px;font-weight:bold;letter-spacing:-0.02em;text-align:center;color:#333333;">Verify Your Email</h1>
                <p style="margin:0;font-size:16px;line-height:24px;text-align:center;color:#555555;">Thanks for signing up! Please use the verification code below to complete your registration.</p>
                <!-- Verification Code Box -->
                <div style="margin:30px 0;padding:25px 20px;background-color:#f8f9fa;border-radius:6px;text-align:center;border-left:4px solid #0066FF;">
                  <p style="margin:0 0 10px 0;font-size:14px;line-height:20px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
                  <p style="margin:0;font-size:32px;line-height:40px;font-weight:bold;letter-spacing:5px;color:#333333;font-family:monospace;">${code}</p>
                </div>
                <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;color:#555555;">This code will expire in 10 minutes. If you didn't request this verification, you can safely ignore this email.</p>
                <!-- Action Button -->
                <p style="margin:0;text-align:center;">
                  <a href="https://yourcompany.com/verify" style="background:#0066FF;text-decoration:none;padding:12px 30px;color:white;border-radius:4px;display:inline-block;mso-padding-alt:0;text-underline-color:#0066FF;">
                    <!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;mso-text-raise:20pt">&nbsp;</i><![endif]-->
                    <span style="mso-text-raise:10pt;font-weight:bold;">Verify Email Address</span>
                    <!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%">&nbsp;</i><![endif]-->
                  </a>
                </p>
              </td>
            </tr>
            <!-- Additional Info -->
            <tr>
              <td style="padding:30px;background-color:#ffffff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);margin-top:20px;text-align:center;">
                <p style="margin:0 0 15px 0;font-size:16px;line-height:24px;color:#555555;">Having trouble? Contact our support team for assistance.</p>
                <img src="https://via.placeholder.com/540x200/E9F2FF/0066FF?text=Welcome+to+Our+Service" width="540" alt="Welcome Banner" style="width:100%;height:auto;border:none;border-radius:4px;text-decoration:none;color:#ffffff;">
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:30px;text-align:center;font-size:14px;color:#777777;">
                <p style="margin:0 0 8px 0;">Your Company Name, Inc.</p>
                <p style="margin:0 0 8px 0;">123 Street Address, City, Country</p>
                <p style="margin:0;">This email was sent to ${email}</p>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  const msg = {
    to: email,
    from: "imamasyari700@gmail.com",
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
    html: htmlTemplate,
  };

  try {
    console.log("Sending email to:", email);
    const result = await sgMail.send(msg);
    console.log(`Verification code sent to ${email}`, result);
  } catch (error: any) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("SendGrid response error:", error.response.body);
    }
    throw new Error("Failed to send verification code");
  }
}
