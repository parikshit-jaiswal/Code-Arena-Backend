import mongoose from 'mongoose';

export interface IParticipant {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
}

export interface ISubmission {
    submissionId: mongoose.Types.ObjectId;
}

export interface IContest extends mongoose.Document {
    title: string;
    description?: string;
    moderators: mongoose.Types.ObjectId[];
    organizer: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    duration: number; // in minutes
    problems: mongoose.Types.ObjectId[];
    participants: IParticipant[];
    submissions: ISubmission[];
    score?: number;
    attempts?: number;
    bestSubmissionTime?: number; // in seconds or milliseconds
    totalScore?: number;
    isRated: boolean;
    tags?: string[];
    rules?: string;
    createdAt: Date;
    updatedAt: Date;
}