import { handleLogin } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("estoy en el login de auth0");
    
    await handleLogin(req, res, {
      returnTo: '/dashboard', // Página a la que redirigir después del login
    });
  } catch (error) {
    console.error(error);
  }
}
