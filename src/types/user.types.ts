import mongoose from 'mongoose';

export interface IContestParticipation {
    contestId: mongoose.Types.ObjectId;
    rank: number;
    score: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface ISolvedProblem {
    problemId: mongoose.Types.ObjectId;
    solvedAt: Date;
}

export interface IProfile {
    name?: string;
    institution?: string;
    country?: string;
    avatarUrl?: string;
    bio?: string;
}

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

export interface IUser extends mongoose.Document, IUserMethods {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'participant';
    profile?: IProfile;
    rating: number;
    contestsParticipated: IContestParticipation[];
    contestsCreated: IContestParticipation[];
    solvedProblems: ISolvedProblem[];
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}
