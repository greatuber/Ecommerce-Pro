"use client";

import validator from "validator";
import { useForm } from "react-hook-form";
import { AuthError, createUserWithEmailAndPassword, AuthErrorCodes } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Aos from "aos";
import { ChevronLeftIcon } from "lucide-react";

// Utilities
import { auth, db } from "../../config/firebase.config";
import { useAppSelector } from "hooks/redux.hooks";

// Components
import Header from "@components/Header/Header";
import InputErrorMessage from "@components/InputErrorMessage/InputErrorMessage";
import CustomInputContainer from "@components/CustomInputContainer/CustomInputContainer";
import Footer from "@components/Footer/Footer";
import Loading from "@components/Loading/Loading";

interface SignUpform {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

Aos.init();

export default function SignUpPage() {
  const { isAuthenticated } = useAppSelector((rootReducer: any) => rootReducer.userReducer);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const handleRouterLoginClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      return router.push("/pages/login");
    }, 1000);
  };
  const handleRouterBackClick = () => router.back();

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Cadastro realizado com sucesso.");
      return redirect("/");
    }
  }, [isAuthenticated]);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setError,
  } = useForm<SignUpform>();

  const handleSubmitPress = async (data: SignUpform) => {
    try {
      setIsLoading(true);
      const userCredentials = await createUserWithEmailAndPassword(auth, data.email, data.password);

      await addDoc(collection(db, "users"), {
        id: userCredentials.user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: userCredentials.user.email,
        provider: "firebase",
      });
    } catch (error) {
      const _error = error as AuthError;

      if (_error.code === AuthErrorCodes.EMAIL_EXISTS) {
        return setError("email", { type: "alreadyInUse" });
      }
    } finally {
      setIsLoading(true);
    }
  };

  const watchPassword = watch("password");

  return (
    <>
      {isLoading && <Loading />}
      <Header />
      <div className="mt-7 pl-4">
        <button
          className="flex gap-1 items-center text-[#283040] hover:text-[#8c3a60] transition duration-300"
          data-aos="fade-right"
          onClick={handleRouterBackClick}
        >
          <ChevronLeftIcon size={25} />
          <h1 className="font-bold text-xl">Voltar</h1>
        </button>
      </div>
      <div className="grid place-content-center place-items-center p-5 pt-3" data-aos="fade-down">
        <div
          style={{ animation: "slideInFromLeft 1s ease-out", boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
          className=" max-w-[30rem] rounded overflow-hidden p-8 space-y-8 bg-[#283040]"
        >
          <h2
            style={{ animation: "appear 2s ease-out" }}
            className="text-center text-4xl font-extrabold text-[#8C3A60] border-b border-solid border-[#f2B6C1] pb-2 px-10"
          >
            Crie a sua conta
          </h2>

          <CustomInputContainer label="Nome" func={{ ...register("firstName", { required: true }) }} type="text">
            {errors?.firstName?.type === "required" && <InputErrorMessage>O nome é obrigatório.</InputErrorMessage>}
          </CustomInputContainer>

          <CustomInputContainer label="Sobrenome" func={{ ...register("lastName", { required: true }) }} type="text">
            {errors?.lastName?.type === "required" && <InputErrorMessage>O sobrenome é obrigatório.</InputErrorMessage>}
          </CustomInputContainer>
          <CustomInputContainer
            label="Email"
            type="text"
            func={{
              ...register("email", {
                required: true,
                validate: (value) => {
                  return validator.isEmail(value);
                },
              }),
            }}
          >
            {errors?.email?.type === "required" && <InputErrorMessage>O email é obrigatório.</InputErrorMessage>}
            {errors?.email?.type === "alreadyInUse" && (
              <InputErrorMessage>Este email já está sendo usado.</InputErrorMessage>
            )}
            {errors?.email?.type === "validate" && <InputErrorMessage>Insira um email válido.</InputErrorMessage>}
          </CustomInputContainer>

          <CustomInputContainer
            label="Senha"
            func={{ ...register("password", { required: true, minLength: 6 }) }}
            type="password"
          >
            {errors?.password?.type === "required" && <InputErrorMessage>A senha é obrigatória.</InputErrorMessage>}
            {errors?.password?.type === "minLength" && (
              <InputErrorMessage>A senha não pode conter menos de 6 caracteres.</InputErrorMessage>
            )}
          </CustomInputContainer>

          <CustomInputContainer
            label="Confirmar Senha"
            type="password"
            func={{
              ...register("confirmPassword", {
                required: true,
                minLength: 6,
                validate: (value) => {
                  return value === watchPassword;
                },
              }),
            }}
          >
            {errors?.confirmPassword?.type === "required" && (
              <InputErrorMessage>A confirmação da senha é obrigatória.</InputErrorMessage>
            )}

            {errors?.confirmPassword?.type === "validate" && <InputErrorMessage>As senhas não coincidem.</InputErrorMessage>}
          </CustomInputContainer>
          <button
            className="w-full py-2 px-4 bg-[#8C3A60] hover:bg-[#F2B6C1] hover:text-black rounded shadow-lg text-white font-semibold transition duration-300"
            onClick={() => handleSubmit(handleSubmitPress)()}
          >
            Criar conta
          </button>
          <div className="text-center text-gray-300 flex justify-center gap-2">
            Já possui uma conta?{" "}
            <p className="text-[#F2B6C1] hover:underline font-bold cursor-pointer" onClick={handleRouterLoginClick}>
              Login
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
