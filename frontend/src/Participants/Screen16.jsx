import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import io from 'socket.io-client';
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const socket = io.connect(`${REACT_APP_BACKEND_URL}`, {
  transports: ['websocket', 'polling'], // Use default transports
});

function Screen16() {
  const navigate = useNavigate()
  let { pnumber, condition,currentround } = useParams();
  const [showFC, setShowFc] = useState(false);
  const [showSC, setShowSC] = useState(false);
  const [showPre, setShowPre] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [effortLevel, setEffortLevel] = useState(0)
  
  const [tip,setTip] = useState()
  if(currentround == 0){
    currentround = 'Practice Round'
  }
  const handleInp = (e) => {
    setTip(e.target.value)
  }
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

  const getEffortLevel = async() => {
    await axios.post(`${REACT_APP_BACKEND_URL}/generate/geteffortlevel`,{pnumber, currentround, 'token': localStorage.getItem('token')},{
      withCredentials:true
    })
    .then((res)=>{
      console.log(47, res.data)
      setEffortLevel(res.data.effort)
    })
    .catch((e)=>{
      console.log("error : ",e)
    })
  }
  useEffect(() => {
    verifyUser()
    getEffortLevel()
    if (condition === "Fixed Condition") {
      setShowFc(true);
    }
    if (condition === "Service Charge") {
      setShowSC(true);
    }
    if (condition === "Pre-Tip") {
      setShowPre(true);
    }
    if (condition === "Post-Tip") {
      setShowPost(true);
    }
  }, []);

  const apicall = async () => {
    try{
      const x = await axios.post(`${REACT_APP_BACKEND_URL}/generate/addworkertip`,{pnumber, currentround, tip, 'token': localStorage.getItem('token')},{
        withCredentials:true
      })
      console.log(26,x.data)
    }catch(e){
      console.log('error ',e)
    }
  }
  const clickedNext = async () => {

    await apicall()
    
    await axios
            .post(
              `${REACT_APP_BACKEND_URL}/generate/matchpnumberforcustomer`,
              { pnumber, currentround,'token': localStorage.getItem('token') },
              { withCredentials: true }
            )
            .then((res) => {
              console.log(120, res);              
              navigate(`/screen18/${pnumber}/${condition}/${currentround}`)
              socket.emit("nextto17", {
                participant: res.data.participant,
              });
            });

  };

  const finalMessageStyle = {
    color: "#FFD700",
    fontSize: "1.5rem",
    marginTop: "1.5rem",
    textAlign: "center",
  };

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
            <div style={{color:'aliceblue'}}><u>TIPPING DECISION &nbsp;|&nbsp; {currentround}</u></div>
            <div
              style={{
                fontSize: "1.2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                paddingTop: "2rem",
                color: "#6AD4DD",
                textAlign: "left",
              }}
            >
              <div>
                As Customer, you now need to decide how much to tip the Worker.
              </div>
              <div>
                You need to decide how much to tip the Worker for their service
                after they has chosen an effort level to serve you. The amount
                of tip can range from zero up to 80 tokens (rounded to the
                nearest whole number). The Worker will be informed of the tip
                you pay after they has made their choice of effort level.
              </div>
              <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    color: "aliceblue",
                    padding: "1rem 0",
                  }}
                >
                  Worker Effort Level
                </div>
                <div>
                  In this round, the Worker that you are paired with has chosen
                  the effort level:
                </div>
                <div>
                  Worker Effort Level:{" "}
                  <span style={{ color: "aliceblue" }}>{effortLevel}</span>
                </div>

                <div
                style={{
                  fontSize: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >

<div>Please make your choice: </div>
                  <div style={{ color: "aliceblue" }}>
                    How much do you want to tip the Worker for their service?
                  </div>
                  <div>
                    <input
                      style={{
                        width: "7rem",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        padding: "0.5rem",
                        fontSize: "1rem",
                        color: "aliceblue",
                        borderBottom: "1px solid #6AD4DD",
                      }}
                      type="text"
                      placeholder="Enter Tip"
                      name="tip"
                      value={tip}
                      onChange={(e) => handleInp(e)}
                    />
                  </div>
                Please click ‘Next’ to continue.
              </div>
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
                    width: "2.9rem",
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
        </div>
      </div>
    </>
  );
}

export default Screen16;
