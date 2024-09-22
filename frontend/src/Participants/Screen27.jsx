import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
function Screen27() {
  const navigate = useNavigate()
  let [participantReached, setParticipantReached] = useState(0)
  const verifyUser = () => {
    axios
      .post(`${REACT_APP_BACKEND_URL}/generate/getlink`,{'token': localStorage.getItem('token')}, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(21, res.data);
        if (res.data.msg === "access denied") {
          navigate("/notfound");
        }
      })
      .catch((e) => {
        navigate("/notfound");
      });
  };

  useEffect(()=>{
    setParticipantReached((prev)=>prev+1)
    console.log(25, participantReached)
    verifyUser()
  },[])
  return (
    <>
      <div
        style={{
          height: "100vh",
          backgroundColor: "black",
          color: "#6AD4DD",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "40rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.4rem",
            fontSize: "1.4rem",
          }}
        >
          <div
            style={{
              color: "aliceblue",
              fontSize: "1.5rem",
              textAlign: "center",
            }}
          >
        <div style={{fontSize:'2rem'}}><u>END OF STUDY</u></div>
        <div               style={{
                fontSize: "1.2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                paddingTop: "2rem",
                color: "#6AD4DD",
                textAlign: "left",
              }}>
                <div>Thank you very much for your participation today! </div>
        </div>
        </div>           
        </div>
      </div>
    </>
  );
}

export default Screen27;
