"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, UserCheck, X } from "lucide-react";

interface VerificationNotifier {
    type : string;
    eventId : string;
    customerId : string;
    status : string;
}


interface VerificationNotifierProps{
    activeEventId? : string;
}


export default function VerificationNotifier({activeEventId} : VerificationNotifierProps){
    const [verifiedUser , setVerifiedUser ] = useState<VerificationNotifier | null>(null);
    const [isVisible , setIsVisible] = useState(false);

    useEffect(() =>{

        // create a new event source connection to the server
        const eventSource = new EventSource("http://localhost:8000/api/events")


        // make a listener for the event source connection
        eventSource.onmessage = (event ) => {

            // when message is received , parse the data and check the type of event is USER_VERIFIED
            try {
                const data : VerificationNotifier = JSON.parse(event.data);

                if (data.type === "USER_VERIFIED") {

                    // if user verified but the active event id is not the same event id from the verified user, 
                    // return and do not show the notification
                    // this is to prevent showing the notification for other events that are not in active state
                    if (activeEventId && data.eventId !== activeEventId) return;

                    // set the data to state to show the notificatoon
                    setVerifiedUser(data);
                    setIsVisible(true);


                    // set timeout to hide the notification after 5 seconds
                    setTimeout(()=>{
                        setIsVisible(false);
                    },5000)


                }
            } catch ( error ){
                console.error("Error parsing event data:", error);
            }
        };

        // handle error event if listener fails to connect to the server or if the connection is lost
        eventSource.onerror = (error) =>{
            console.log("[SSE CONNECTION ERROR]", error);
        };

        // return a cleanup function to close the event source connection when the component unmounts or when the activeEventId changes
        return () =>{
            eventSource.close();
        }
    },[activeEventId]);

    // if notification is visible or no verified user, return null to not render the component
    if (!isVisible || !verifiedUser) return null;


    return (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 p-4 text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-emerald-400">Access Granted!</h4>
        <p className="text-xs text-slate-200">
          Customer ID: <span className="font-mono font-bold">{verifiedUser.customerId}</span>
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
    )
}