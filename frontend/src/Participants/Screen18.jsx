import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios'
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
function Screen18() {
  const navigate = useNavigate()
  let { pnumber, condition,currentround } = useParams();
  const [updatedCurrentRound, setUpdatedCurrentRound] = useState()
  const [showFC, setShowFc] = useState(false);
  const [showSC, setShowSC] = useState(false);
  const [showPre, setShowPre] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [effort, setEffort] = useState()
  const [tip, setTip] = useState(0)
  const [roundInfo, setRoundInfo] = useState()

  if(currentround == 0){
    currentround = 'Practice Round'
  }
    const verifyUser = () => {
    axios
      .post(`${REACT_APP_BACKEND_URL}/generate/getlink`,{'token': localStorage.getItem('token')}, {
        withCredentials: true,
      })
      .then(async(res) => {
        console.log(21, res.data);
        if (res.data.msg === "access denied") {
          navigate("/notfound");
        }
        await axios.post(`${REACT_APP_BACKEND_URL}/generate/getroundinfo`,{'token': localStorage.getItem('token'), currentround, pnumber},{withCredentials:true})
        .then(async(res)=>{
          await setRoundInfo(res.data.entry)
          console.log(59, res.data.entry)
          console.log(60, roundInfo)
        })
      })
      .catch((e) => {
        navigate("/notfound");
      });
  };
  const getEffort = async() => {
    await axios.post(`${REACT_APP_BACKEND_URL}/generate/geteffortlevel`,{pnumber, currentround, 'token': localStorage.getItem('token')},{
      withCredentials:true
    })
    .then((res)=>{
      // console.log(36, res.data.effort)
      setEffort(res.data.effort)
    })
  }

  const getTip = async () =>{
    await axios.post(`${REACT_APP_BACKEND_URL}/generate/gettip`,{pnumber, currentround, 'token': localStorage.getItem('token')},{
      withCredentials:true
    })
    .then((res)=>{
      console.log(36, res.data.tip)
      setTip(res.data.tip)
    })  
  }
  
  useEffect(() => {
    getEffort()
    getTip()
    verifyUser()
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

  const updateRound = async() => {
    await axios.post(`${REACT_APP_BACKEND_URL}/generate/getroundnumber`,{'token': localStorage.getItem('token')},{
      withCredentials:true
  })
  .then((res)=>{
      setUpdatedCurrentRound(res.data.currentRound+1)
      console.log(77, res.data.currentRound)
      axios.post(`${REACT_APP_BACKEND_URL}/generate/updateroundnumber`,{currentround:res.data.currentRound+1, 'token': localStorage.getItem('token')},{
          withCredentials:true
      })
      .then((res)=>{
          console.log(36,res.data)    
      })
  })
  }

  const clickedNext = async() => {
    console.log(88, currentround)
    if(currentround == 'Practice Round'){currentround=0}
    await axios.post(`${REACT_APP_BACKEND_URL}/generate/selectonecustomer`,{'token': localStorage.getItem('token')},{withCredentials:true})
    .then(async(res)=>{
      console.log(90, res)
      console.log(91, Number(pnumber))
      console.log(91, res.data.selectedParticipant.participant_number)
      if(Number(pnumber) == res.data.selectedParticipant.participant_number){console.log(111);await updateRound()}
    })
    .catch((e)=>{
      console.log('error :',e)
    })
    if(currentround == 0){
      navigate(`/screen10/${pnumber}/${condition}`);
    }else{
      navigate(`/screen20/${pnumber}/${condition}/${currentround}`)
    }
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
            <div style={{fontSize:'2rem'}}><u>COMPENSATION OUTCOMES &nbsp;|&nbsp; {currentround}</u></div>
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
              {currentround === "Practice Round" && (
                <div style={{ padding: "1rem 0" }}>
                  Please note that this round is for PRACTICE ONLY and will NOT
                  be paid.
                </div>
              )}
              <div>Your compensation in this round is as follows:</div>

              {
                showFC && <div style={{
                    display:'flex',
                        flexDirection:'column',
                        gap:'1.3rem'
                }}>
                    <div>
                        <div>1. Your base payoff: <span style={{color:'aliceblue'}}>60 tokens</span></div>
                        <div>2. Your satisfaction from Worker’s service: <span style={{color:'aliceblue'}}>{effort*200}</span></div>
                    </div>
                    <div>Your total compensation in this round is: <span style={{color:'aliceblue'}}>{60+(effort*200)}</span> tokens.</div>
                </div>
              }

              {
                showSC && <div style={{
                    display:'flex',
                        flexDirection:'column',
                        gap:'1.3rem'
                }}>
                    <div>
                        1. Your base payoff: <span style={{color:'aliceblue'}}>60 tokens</span><br/>
                        2. Your satisfaction from Worker’s service: <span style={{color:'aliceblue'}}>{effort*200}</span><br/>
                        3. Service charge paid to the Worker: <span style={{color:'aliceblue'}}> 40 tokens</span>
                    </div>
                    <div>Your total compensation in this round is: <span style={{color:'aliceblue'}}>{60+(effort*200)-40} tokens.</span></div>
                </div>
              }
              {
                (showPre || showPost) && <div style={{
                    display:'flex',
                    flexDirection:'column',
                    gap:'1.3rem'
                }}>
                   <div>
                   1. Your base payoff: <span style={{color:'aliceblue'}}>60 tokens.</span><br/>
                   2. Your satisfaction from Worker’s service: <span style={{color:'aliceblue'}}>{effort*200} tokens.</span><br/>
                   3. Tip paid to the Worker: <span style={{color:'aliceblue'}}>{tip}</span> tokens.
                   </div>

                   <div>Your total compensation in this round is: <span style={{color:'aliceblue'}}>{60+(effort*200)-tip} </span></div>
                  </div>
              }
            </div>
          </div>
          <div
                style={{
                  fontSize: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
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
              {/* {
                currentround == 'Practice Round' &&
                <div style={finalMessageStyle}>Lets go for actual rounds!</div> 
              }   */}
        </div>
      </div>
    </>
  );
}

export default Screen18;
