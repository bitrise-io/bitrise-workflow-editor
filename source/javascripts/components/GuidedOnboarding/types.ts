import { ReactNode } from "react";

export interface AppStep {
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
