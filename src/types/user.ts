// File: types.ts
export type User = {
  id: string;
  uid?: string;
  name: string;
  avatar?: string;
  online?: boolean;
};

export type Mentor = {
  uid: string;
  name: string;
  role: "mentor";
  email: string;
  bio: string;
  profession: string;
  skillFocus: string;
  photoURL: string;
  accountSetup: boolean;
  assignedTo: any | null;
  assignedMentees: Array<any>;
  createdAt: any;
  updatedAt: any;
};
