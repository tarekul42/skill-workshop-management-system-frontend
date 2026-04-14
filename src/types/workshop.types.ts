export interface ILevel {
    _id: string;
    name: string;
}

export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    thumbnail?: string;
    description?: string;
}

export interface IWorkshop {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    images: string[];
    location?: string;
    price?: number;
    startDate?: string;
    endDate?: string;
    whatYouLearn: string[];
    prerequisites: string[];
    benefits: string[];
    syllabus: string[];
    maxSeats?: number;
    minAge?: number;
    currentEnrollments: number;
    category: string | ICategory;
    level: string | ILevel;
    createdBy?: string | { _id: string; name: string; email: string };
    createdAt: string;
    updatedAt: string;
}