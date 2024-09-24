import React, { useEffect } from 'react'
import { useNavigate,useParams } from 'react-router-dom'
import axios from 'axios';
import io from "socket.io-client";
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const socket = io.connect(`${REACT_APP_BACKEND_URL}`, {
  transports: ["websocket", "polling"], // Use default transports
});

function Screen9() {
  const navigate = useNavigate()
  const { pnumber, condition } = useParams();
  const clickedNext = async () => {
    socket.emit('registerParticipant',pnumber)
    try {
      const roundRes = await axios.post(`${REACT_APP_BACKEND_URL}/generate/getroundnumber`,{'token': localStorage.getItem('token')}, {
        withCredentials: true
      });
  
      if (roundRes.data.msg === 'activeAtMoment') {
        console.log(15, roundRes.data);
      }
  
      console.log(17, roundRes.data.currentRound);
  
      if (roundRes.data.currentRound === 0) {
        const screen11Res = await axios.post(`${REACT_APP_BACKEND_URL}/generate/screen11reachedcountincrease`, {'token':localStorage.getItem('token')},{
          withCredentials: true
        });
  
        if (screen11Res.data.msg === 'activeAtMoment') {
          console.log(15, screen11Res.data);
        }
  
        console.log(17, screen11Res.data);
        navigate(`/screen11/${pnumber}/${condition}/${screen11Res.data.activeatpg11}`);
      } else {
        navigate(`/screen10/${pnumber}/${condition}`);
      }
  
    } catch (error) {
      console.error("Error in clickedNext:", error);
    }
  };
  
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
    verifyUser()
  },[])
  return (
    <>
    <div style={{
          height: "100vh",
          backgroundColor: "black",
          color: "#6AD4DD",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <div style={{
            width: "40rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.4rem",
            fontSize: "1.4rem",
          }}>
 <div
            style={{
              color: "aliceblue",
              textAlign: "center",
              fontSize: "2rem",
            }}
          >
            <b>
              <u>PRACTICE ROUND</u>
            </b>
          </div>
          <div style={{
            display:'flex',
            flexDirection:'column',
            gap:'1.2rem'
          }}>
            <div>You will first have the opportunity to familiarize yourself with the computer interface during a practice round. This round is for practice ONLY and is intended to help you have a better understanding of the study. This round will NOT be paid.</div>
            <div>You will start the practice round on the next page.</div>
          </div>

          <div>Please click ‘Next’ to continue.</div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "aliceblue",
                color: "black",
                marginTop: "1rem",
                padding: "1rem",
                borderRadius: "0.2rem",
                cursor: "pointer",
              }}
              onClick={clickedNext}
            >
              Next
            </div>
          </div>

        </div>
    </div>
    </>
  )
}

export default Screen9
