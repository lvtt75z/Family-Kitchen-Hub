// import React, { useEffect, useState } from "react";
import "../styles/Header.css";
// import { Link, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Link as MuiLink } from "@mui/material";
// export default function Header() {
//   const [user, setUser] = useState(null);
  

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const handleFeatureClick = (e) => {
//     if (!user) {
//       e.preventDefault(); // Ngăn chuyển trang
//       toast.warning("🍳 Please login to access this feature!", {
//         theme: "colored",
//       });
//     }
//   };

//   return (
//     <>
//       <div className="top-strip" aria-hidden="true"></div>

//       <header className="site-header" role="banner">
//         <div className="nav-inner">
//           <div className="brand">
//             <div className="logo" aria-hidden="true">
//               <svg
//                 width="20"
//                 height="20"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
              
//                 <path
//                   d="M7 11c0-1.657 1.343-3 3-3h4c1.657 0 3 1.343 3 3v1H7v-1z"
//                   fill="#E76F00"
//                 />
//                 <path
//                   d="M6 12h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"
//                   fill="#F7F7F7"
//                   stroke="#E0E0E0"
//                 />
//                 <path
//                   d="M7 11V10a5 5 0 0 1 10 0v1"
//                   stroke="#E76F00"
//                   strokeWidth="0.5"
//                   opacity="0.6"
//                 />
//               </svg>
//             </div>
//             <div className="site-title">Family Menu Manager</div>
//           </div>

//           <div className="spacer"></div>

//           <nav
//             className="site-nav"
//             role="navigation"
//             aria-label="Main navigation"
//           >
//             <Link to="/home">Home</Link>
//             <Link to="/manage" onClick={handleFeatureClick}>
//               Feature
//             </Link>
//             <a href="#">Tools</a>
//             <a href="#">Get Started</a>

//             {user ? (
//               <div className="user-info">👋 Hi, {user.fullName || user.username}</div>
//             ) : (
//               <Link to="/login" className="btn-signin">
//                 Sign In
//               </Link>
//             )}

//           </nav>
//         </div>
//       </header>
//     </>
//   );
// }
import React from "react";

export default function FridgeAbstract() {
  return (
    <div className="abs-fridge">
      <div className="abs-door">
        <div className="abs-line"></div>
        <div className="abs-line short"></div>
      </div>

      <div className="abs-body">
        <div className="abs-shelf"></div>
        <div className="abs-shelf"></div>

        <div className="abs-bubbles">
          <div className="bubble"></div>
          <div className="bubble mid"></div>
          <div className="bubble small"></div>
        </div>
      </div>
    </div>
  );
}


