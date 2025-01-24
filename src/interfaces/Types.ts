// AUTH
// LOGIN

export interface ILoginProps {
  email: string;
  password: string;
}

export interface ILoginErrors {
  email?: string;
  password?: string;
}

// REGISTER

export interface IRegisterProps {
  id: string,
  name: string;
  email: string;
  password: string;
  ConfirmPassword: string;
  address: string;
  image_url: string;
  role: string
}

export interface IRegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  ConfirmPassword?: string;
  address?: string;
  image_url?: string;
}


// USERS

export interface AuthResponse {
  data: {
    token: string;
    user: IUser;
  };
  loggin: boolean;
}

export interface IUser {
  id: string;
  email: string;
  roles: string[];
  name?: string;
  address?: string;
  role?: string;
  image_url?: string;
  created_atts?: string;
}
//EMPLOYEE



//RESERVATIONS

export interface IReservation {
  date: string,
  time: string,
  guest: number
}

export interface IReservations extends IReservation {
  id: string,
  status: string,
  create_at: string
}