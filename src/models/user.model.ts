import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser } from '../types/user.types';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
        role: {
            type: String,
            enum: ['admin', 'participant'],
            default: 'participant',
        },
        profile: {
            name: { type: String },
            institution: { type: String },
            country: { type: String },
            avatarUrl: { type: String },
            bio: { type: String },
        },
        rating: {
            type: Number,
            default: 1000,
        },
        contestsParticipated: [
            {
                contestId: { type: Schema.Types.ObjectId, ref: 'Contest' },
                rank: Number,
                score: Number,
            },
        ],
        solvedProblems: [
            {
                problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
                solvedAt: Date,
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    console.log(secret);
    if (!secret) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }
//merging with main
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        secret,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
                ? process.env.ACCESS_TOKEN_EXPIRY
                : undefined,
            algorithm: 'HS256',
        }
    );
};


userSchema.methods.generateRefreshToken = function (): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    console.log(parseInt(process.env.REFRESH_TOKEN_EXPIRY || '0'));
    console.log(secret);
    if (!secret) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }

    return jwt.sign(
        {
            _id: this._id,
        },
        secret,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
                ? process.env.REFRESH_TOKEN_EXPIRY
                : undefined,
            algorithm: 'HS256',
        }
    );
};


const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
