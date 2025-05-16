import { NodeMailgun } from "ts-mailgun";

const mailer = new NodeMailgun();
mailer.apiKey = "9f592d8aee7f33de7549ba25e95a5eb4-e71583bb-982c4d18"; // Set your API key
mailer.domain = "imamasyari.com";
mailer.fromEmail = "imamasyari700@gmail.com";
mailer.fromTitle = "Login Verify Code";

export async function sendVerifyCode(email: string, code: string) {
  mailer.init();
  mailer
    .send(email, code, "<h1>hsdf</h1>")
    .then((result) => console.log("Done", result))
    .catch((error) => console.error("Error: ", error));
}
