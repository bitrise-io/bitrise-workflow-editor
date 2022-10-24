import { ReactNode } from "react";

export interface AppStep {
    id: string;
    title: string;
    isSuccessful: boolean;
    subSteps: SubStep[];
}

export interface SubStep {
    id: number;
    title: string;
    content: ReactNode;
    href?: string;
}

export const BuildStatus = {
    Running: 0,
    Success: 1,
    Error: 2,
    Aborted: 3,
    AbortedWithSuccess: 4,
} as const;
