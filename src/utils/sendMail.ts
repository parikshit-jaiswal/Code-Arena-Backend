import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);



export const sendOtpEmail = async (email: string, otp: string) => {
    if (!email || !otp) {
        throw new Error("Email and OTP are required");
    }

    const { data, error } = await resend.emails.send({
        from: "Code Arena <onboarding@resend.dev>",
        to: [email],
        subject: "Your OTP Code",
        html: html || `
            <div style="font-family: sans-serif; padding: 1rem;">
                <h2>Verify Your Email</h2>
                <p>Your OTP code is:</p>
                <h1 style="color: #4F46E5;">${otp}</h1>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `,
    });

    if (error) {
        console.error("Error sending OTP email:", error);
        throw new Error("Failed to send OTP email");
    }
    console.log(data)
    return data;
};
