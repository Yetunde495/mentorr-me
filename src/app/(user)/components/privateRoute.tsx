"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import axios from "axios";
import { setUser } from "@/features/authSlice";
import { useDispatch } from "react-redux";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const token = getCookie("access_token");

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        dispatch(setUser(response.data));
      }
    } catch (error) {
      console.log("Profile fetch error:", error);
      router.push("/");
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/");
    } else {
      // fetchProfile();
    }
  }, [token]);

  return <>{children}</>;
};

export default PrivateRoute;

