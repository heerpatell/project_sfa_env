import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const socket = io(`${REACT_APP_BACKEND_URL}`, {
  transports: ["websocket", "polling"],
});

function Waiting() {
  let { pnumber, condition, currentround } = useParams();
  const [assignedCategory, setAssignedCategory] = useState();
  const navigate = useNavigate();

  const getCategory = async () => {
    await axios.post(`${REACT_APP_BACKEND_URL}/generate/getassignedcategory`, { pnumber,'token':localStorage.getItem('token') }, { withCredentials: true })
      .then((res) => {
        if (res.data.assignedCategory === 'Worker') {
          setAssignedCategory('Worker');
        } else if (res.data.assignedCategory === 'Customer') {
          setAssignedCategory('Customer');
        }
      });
  };

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    const handleMoveto13 = () => {
      console.log("Received moveto13");
      navigate(`/screen13/${pnumber}/${condition}/${currentround}`);
    };

    const handleMoveto15 = (data) => {
      console.log('Received moveto15:', data);
      let { participant, socketId } = data;
      participant = String(participant)
      console.log(typeof(pnumber)," ", typeof(participant))
      if (pnumber === participant) {
        console.log('Navigating to screen 15');
        navigate(`/screen15/${pnumber}/${condition}/${currentround}`);
      }
    };

    const handlePost15 = (data) => {

      console.log('Received moveto15:', data);
      let { participant, socketId } = data;
      participant = String(participant)
      console.log(typeof(pnumber)," ", typeof(participant))
      if (pnumber === participant) {
        console.log('Navigating to screen 15');
        navigate(`/screen15/${pnumber}/${condition}/${currentround}`);
      }
    };

    const handleMoveto14 = (data) => {
      
      console.log('Received moveto14:', data);
      let { participant, socketId } = data;
      participant = String(participant)
      console.log(typeof(pnumber)," ", typeof(participant))

      const { exceptPnumber } = data;
      if ( pnumber == participant) {
        console.log("Navigating to screen 14");
        navigate(`/screen14/${pnumber}/${condition}/${currentround}`);
      }
    };

    const handleMoveto17 = (data) => {
      console.log('Received moveto17:', data);
      let { participant, socketId } = data;
      participant = String(participant)
      console.log(typeof(pnumber)," ", typeof(participant))

      const { exceptPnumber } = data;
      if ( pnumber == participant) {
        console.log("Navigating to screen 17");
        navigate(`/screen17/${pnumber}/${condition}/${currentround}`);
      }
    };

    const handleMovetoWaiting = () => {
      console.log("Received movetoWaiting");
      navigate(`/waiting/${pnumber}/${condition}/${currentround}`);
    };

    const handleMoveto18 = (data) => {

      console.log('Received moveto18:', data);
      let { participant, socketId } = data;
      participant = String(participant)
      console.log(typeof(pnumber)," ", typeof(participant))
      if (pnumber === participant) {
        console.log('Navigating to screen 18');
        navigate(`/screen18/${pnumber}/${condition}/${currentround}`);
      }
    };

    const handleMoveto12 = () => {
      console.log("Received moveto12");
      navigate(`/screen12/${pnumber}/${condition}/${currentround}`);
    };

    socket.on("connect", () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on("disconnect", () => {
      console.log('Socket disconnected');
    });

    socket.on("moveto12", handleMoveto12);
    socket.on("moveto13", handleMoveto13);
    socket.on("moveto15", handleMoveto15);
    socket.on("moveto15Post", handlePost15);
    socket.on("moveto14", handleMoveto14);
    socket.on("moveto17", handleMoveto17);
    socket.on("moveto18", handleMoveto18);
    socket.on("movetoWaiting", handleMovetoWaiting);

    return () => {
      socket.off("moveto12", handleMoveto12);
      socket.off("moveto13", handleMoveto13);
      socket.off("moveto15", handleMoveto15);
      socket.off("moveto15Post", handlePost15);
      socket.off("moveto14", handleMoveto14);
      socket.off("moveto17", handleMoveto17);
      socket.off("moveto18", handleMoveto18);
      socket.off("movetoWaiting", handleMovetoWaiting);
      console.log('Cleaning up socket listeners');
    };
  }, [navigate, pnumber, condition, currentround]);

  return (
    <div
      style={{
        backgroundColor: "black",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ color: "white", fontSize: "3rem" }}>
        {assignedCategory === "Worker" && (
          <div>Please wait while the Customer makes their decision</div>
        )}
        {assignedCategory === "Customer" && (
          <div>Please wait while the Worker makes their decision</div>
        )}
      </div>
    </div>
  );
}

export default Waiting;
