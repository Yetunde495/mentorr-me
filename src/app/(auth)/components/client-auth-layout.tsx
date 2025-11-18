"use client"
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {RootState } from '../../../store/store';
import { getCookies } from 'cookies-next';

interface PrivateRouteProps {
  children: ReactNode;
}

const ClientAuthRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // const router = useRouter();
  // const user_id = useSelector((state: RootState) => state.auth.user_id);

  // const cookies = getCookies()

//   useEffect(() => {
//     if (cookies?.access_token) {
//       router.push('/survprompt-chat'); // Redirect to dashboard
//     }
//   }, []);

  return <>{children}</>;
};

export default ClientAuthRoute;