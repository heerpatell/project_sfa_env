import React, { useState,useEffect } from "react";
import "./adminpage.scss";
import { MdOutlineContentCopy } from "react-icons/md";
import axios from "axios";
import {useNavigate} from 'react-router-dom'
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const REACT_APP_FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

function AdminPage() {

  const navigate = useNavigate()
  const [link, setLink] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [participants, setParticipants] = useState()
  const [activeParticipant,setActiveParticipant] = useState(0)
  const [rounds, setRounds] = useState(10)
  const [condition, setCondition] = useState('')

  useEffect(()=>{
    axios.post(`${REACT_APP_BACKEND_URL}/generate/getlink`,{'token': localStorage.getItem('token')},{
      withCredentials:true
    })
    .then(async(res)=>{
      if(res.data.msg === 'access denied'){
        navigate('/notfound')
      }
      else{
        setLink(`${REACT_APP_FRONTEND_URL}/link/${res.data.sessionObj.link}`);
        setParticipants(res.data.sessionObj.no_of_participants);        
        setCondition(res.data.sessionObj.condition)
        console.log(41, res.data.sessionObj)
        setActiveParticipant(res.data.sessionObj.no_of_active_participants);     

      // axios.post('http://localhost:5000/updateparticipant', 
      //   { participants:res.data.sessionObj.no_of_participants}, 
      //   { withCredentials: true })
      //   .then((res) => {
      //     console.log('Response:', res);
      //     if (res.data.msg === 'success') {
      //       console.log('Participant set in backend:', res.data.p);
      //     }
      //   })
      //   .catch((error) => {
      //     console.error('Error occurred:', error.response || error.message);
      //   });
        
      }    
    })
    .catch((e)=>{
      navigate('/notfound')
    })
  },[activeParticipant])

  const copyclicked = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess("Copied!");
    } catch (e) {
      setCopySuccess("Failed to Copy!");
    }
  };

  return (
    <>
      <div className="adminpage-outer">
        <div className="adminpage-content">
          <div style={{ display:'flex', gap:'2rem', justifyContent:'center', paddingTop:'2rem'}}>
          <div
            style={{
              color: "aliceblue",
              letterSpacing: "0.09rem",
              display: "flex",
              border: "1px solid #6AD4DD",
              padding: "1rem",
              width:'40rem',
              fontSize:'1.5rem',
              justifyContent: "space-between",
            }}
          >
            Generated Link :<div style={{ color: "#6AD4DD" }}>{link}</div>
            <MdOutlineContentCopy
              onClick={() => copyclicked(link)}
              style={{
                cursor: "pointer",
                color: "#6AD4DD",
                fontSize: "1.6rem",
              }}
            />
          </div>
          <div>
            {copySuccess && (
              <div
                style={{
                  color: "white",
                  fontSize: "1.3rem",
                  marginTop: "1rem",
                  textAlign: "center",
                }}
              >
                {copySuccess}
              </div>
            )}
          </div>
          </div>

          <div className="secondrow-adminpage">
              <div style={{fontSize:'1.6rem', display:'flex', color:'#adb5bd'}}>Number of Participants: <div style={{color:'#6AD4DD'}}>&nbsp;&nbsp;{participants}</div></div> 
              <div style={{fontSize:'1.6rem', display:'flex', color:'#adb5bd'}}>Number of Rounds: <div style={{color:'#6AD4DD'}}>&nbsp;&nbsp;{rounds}</div></div>
              <div style={{fontSize:'1.6rem', display:'flex', color:'#adb5bd'}}>Entered Condition: <div style={{color:'#6AD4DD'}}>&nbsp;&nbsp;{condition}</div></div>
          </div>

{/*           <div className="thirdrow-adminpage">
            <div style={{fontSize:'2rem', display:'flex'}}>Total participants active at this moment: <div style={{color:'#6AD4DD'}}>&nbsp;&nbsp;{activeParticipant}</div></div>
          </div> */}

        </div>
      </div>
    </>
  );
}

export default AdminPage;
