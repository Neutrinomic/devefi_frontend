import {Box, Center, AbsoluteCenter, Button} from '@chakra-ui/react';
import Marquee from "react-fast-marquee";
import {useEffect, useState} from "react";
import { useBlast, login, logout, refresh } from "../icblast";
import { useNavigate } from "react-router-dom";

export function Intro() {
    const navigate = useNavigate();

    const blast = useBlast();
    useEffect(() => {
        setTimeout(() => {
        if(blast.logged)  navigate("/architect/" + blast.me);
        },3000);
    }, [blast.logged]);

    return <Box className="diagonal-lines2" sx={{left:0, right:0, bottom:0, top:0, position:"fixed"}}  color="gray.800">
       
        <AbsoluteCenter>
         <div class="stack stacklogo" style={{"--stacks": 3}}  >
            <span style={{"--index": 0}}>DeVeFi</span>
            <span style={{"--index": 1}}>DeVeFi</span>
            <span style={{"--index": 2}}>DeVeFi</span>
        </div>
        
        <Box mt="-150px" mb="150px" w="600px" ml="auto" mr="auto" textAlign="center" className="introsubtitle stack"  color="gray.700">
            <Marquee speed="100">
        <span style={{"--index": 0}}>| ---&gt; DECENTRALIZED VECTOR FINANCE | VER 1.0.0 NEXUS | POWERED BY THE INTERNET COMPUTER | GOVERNED BY NEUTRINITE DAO | DEVELOPED BY ANVIL | 2024 |{" "}</span>
            </Marquee>
        </Box>
        <Deffect fs={12}/>
        <Deffect fs={24}/>

        <Center mt="-100px" mb="100px">{blast.logged ? null : <Button variant="outline" onClick={login}>Authenticate</Button>}</Center>
        </AbsoluteCenter>
    </Box>

}


function Deffect({fs}) {
    // Change numbers every 3 seconds
    
    const [line, setLine] = useState([]);

    useEffect(() => {
      // Function to update the line state
      const updateLine = () => {
        const newLine = Array(21600/fs).fill(0).map((_, i) => {
          const n = Math.floor(Math.random() * 10);
          return n < 9 ? n : "------";
        });
        setLine(newLine);
      };
  
      updateLine(); // Initial update
  
      // Function to set a random interval
      const randomInterval = () => {
        return Math.floor(Math.random() * (7000 - 1000 + 1)) + 1000; // Random time between 3000ms (3s) and 7000ms (7s)
      };
  
      let interval = setInterval(() => {
        updateLine(); // Update line at random intervals
        clearInterval(interval); // Clear the current interval
        interval = setInterval(updateLine, randomInterval()); // Set a new interval with a new random time
      }, randomInterval());
  
      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(interval);
    }, []); // Empty dependency array means this effect runs only on mount and unmount
  
    
    return  <AbsoluteCenter>
        <Box w="40vw" color="gray.900" fontSize={fs+"px"} className="deffect" sx={{zIndex:10}}>{line}</Box></AbsoluteCenter>
}