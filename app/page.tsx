"use client";

import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react";

// Utilities
import { auth, db } from "./config/firebase.config";
import { userConverter } from "@converters/firestore.converters";
import { UserActions, loginUser, logoutUser } from "store/reducers/users/user.actions";
import { useAppSelector } from "hooks/redux.hooks";

// Components
import HomePage from "./pages/home/page";
import { Dispatch } from "redux";

export default function Page() {
  const dispatch: Dispatch<UserActions> = useDispatch();

  const { isAuthenticated } = useAppSelector((rootReducer) => rootReducer.userReducer);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      const isSigningOut = isAuthenticated && !user;
      if (isSigningOut) {
        return dispatch(logoutUser());
      }

      const inSigningIn = !isAuthenticated && user;
      if (inSigningIn) {
        const querySnapshot = await getDocs(
          query(collection(db, "users").withConverter(userConverter), where("id", "==", user.uid))
        );

        const userFromFirestore = querySnapshot.docs[0]?.data();

        return dispatch(loginUser(userFromFirestore));
      }
    });
  }, [dispatch]);

  return (
    <>
      <NextUIProvider>
        <HomePage />
      </NextUIProvider>
    </>
  );
}
