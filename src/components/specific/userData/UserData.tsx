// import FileUploadComponent from "@/app/Cloudinary/page";
// import DashboardSidebar from "@/components/header/Header";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import { useEffect } from "react";

// const ProfilePage = () => {
//   const { user, isLoading, error } = useUser();
//   const backendToken = localStorage.getItem("backendToken");
//   useEffect(() => {
//     const registerUserIfNeeded = async () => {
//       try {
//         if (!user) return;

//         const userData = {
//           auth0Id: user.sub,
//           name: user.name,
//           email: user.email,
//           isComplete: false,
//         };

//         if (!user.sub || !backendToken) {
//           const response = await fetch(
//             "http://localhost:3000/auth/signupWithAuth0",
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//               },
//               body: JSON.stringify(userData),
//             }
//           );

//           console.log(response)

//           if (response.status === 400) {
//             console.log("El usuario ya está registrado en el backend.");
//           } else if (response.ok) {
//             const data = await response.json();
//             console.log("Usuario registrado con éxito:", data);
//           } else {
//             throw new Error("Error desconocido al registrar al usuario.");
//           }
//         }
//       } catch (err) {
//         console.error("Error al registrar usuario:", err);
//       }
//     };

//     if (user) {
//       registerUserIfNeeded();
//     }
//   }, [user]);

//   useEffect(() => {
//     const sendTokenToBackend = async () => {
//       try {
//         if (!user) return;

//         const userData = {
//           auth0Id: user.sub,
//           name: user.name,
//           email: user.email,
//         };

//         // console.log(userData);
        

//         const backendResponse = await fetch(
//           "http://localhost:3000/auth/signInWithAuth0",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(userData),
//           }
//         );

//         // console.log(backendResponse);
        

//         const backendData = await backendResponse.json();
//         // console.log(backendData);
        
//         const backendToken = backendData.token;
//         // console.log(backendToken);
        
//         const userLoggedWithAuth0 = backendData.user;

//         if (backendData) {
//           localStorage.setItem("user", JSON.stringify(userLoggedWithAuth0));
//           localStorage.setItem("backendToken", JSON.stringify(backendToken));
//         }
//       } catch (error) {
//         console.error("Error al enviar los datos al backend:", error);
//       }
//     };

//     if (user) {
//       sendTokenToBackend();
//     }
//   }, [user]);

//   if (isLoading) {
//     return <div>Cargando...</div>;
//   }

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }
//   const userDataLocalStorage = localStorage.getItem("user");
//   const userData = JSON.parse(userDataLocalStorage!)
//   console.log(userData);
  

//   return (
//     <div className="flex">
//       <DashboardSidebar />
//       <div className="bg-gray-50 rounded-lg p-6 shadow">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//           Tus datos personales
//         </h2>
//         <p className="text-lg font-medium text-gray-600">
//           Name: <span className="text-gray-800">{userData?.name || "No disponible"}</span>
//         </p>
//         <p className="text-lg font-medium text-gray-600">
//           Email: <span className="text-gray-800">{userData?.email || "No disponible"}</span>
//         </p>
//         <p className="text-lg font-medium text-gray-600">
//           Address: <span className="text-gray-800">{userData?.address || "No disponible"}</span>
//         </p>
//       </div>
//       <FileUploadComponent userprops={user} />
//     </div>
//   );
// };

// export default ProfilePage;
"use client"; // Asegura que el código se ejecuta en el cliente

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Usar `next/navigation` en App Router
import { useUser } from "@auth0/nextjs-auth0/client";
import DashboardSidebar from "@/components/header/Header";
import FileUploadComponent from "@/app/Cloudinary/page";

const ProfilePage = () => {
  const router = useRouter();
  const { user, isLoading, error } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!user) return;

    const registerUserIfNeeded = async () => {
      try {
        const backendToken = localStorage.getItem("backendToken");

        if (!backendToken) {
          const userData = {
            auth0Id: user.sub,
            name: user.name,
            email: user.email,
            isComplete: false,
          };

          const response = await fetch("http://localhost:3000/auth/signupWithAuth0", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (response.ok) {
            console.log("Usuario registrado con éxito");
          } else if (response.status === 400) {
            console.log("El usuario ya está registrado.");
          } else {
            throw new Error("Error al registrar usuario.");
          }
        }
      } catch (err) {
        console.error("Error al registrar usuario:", err);
      }
    };

    registerUserIfNeeded();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const sendTokenToBackend = async () => {
      try {
        const userData = { auth0Id: user.sub, name: user.name, email: user.email };
        const response = await fetch("http://localhost:3000/auth/signInWithAuth0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const backendData = await response.json();
          localStorage.setItem("user", JSON.stringify(backendData.user));
          localStorage.setItem("backendToken", backendData.token);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error al enviar los datos al backend:", error);
      }
    };

    sendTokenToBackend();
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile"); // ✅ Redirige solo cuando el usuario esté autenticado
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const userDataLocalStorage = localStorage.getItem("user");
  const userData = userDataLocalStorage ? JSON.parse(userDataLocalStorage) : null;

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="bg-gray-50 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tus datos personales</h2>
        <p className="text-lg font-medium text-gray-600">
          Name: <span className="text-gray-800">{userData?.name || "No disponible"}</span>
        </p>
        <p className="text-lg font-medium text-gray-600">
          Email: <span className="text-gray-800">{userData?.email || "No disponible"}</span>
        </p>
        <p className="text-lg font-medium text-gray-600">
          Address: <span className="text-gray-800">{userData?.address || "No disponible"}</span>
        </p>
      </div>
      <FileUploadComponent userprops={user} />
    </div>
  );
};

export default ProfilePage;
