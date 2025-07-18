"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useInView } from "react-intersection-observer";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BASE_IMAGE } from "@/lib/constants";
import MessageReadStatus from "./MessageReadStatus";
import { MessageProps } from "@/lib/types";
import Image from "next/image";
import AudioPlayer from "./AudioPlayer";
import VideoPlayer from "./VideoPlayer";


const Message: React.FC<MessageProps> = ({ id, msg, idx, socket }) => {
  const senderId = useSelector(
    (state: RootState) => state.authSlice?.user?.id
  );

  const [expanded, setExpanded] = useState(false);
  const [showReadBy, setShowReadBy] = useState(false);

  const isSender = msg.SenderId === senderId;

  const { ref, inView } = useInView({
    threshold: 0.9,
    triggerOnce: true,
  });

  const alreadyReadByMe = msg.messageReads?.some(r => r.userId === senderId);

  useEffect(() => {
    if (inView && !alreadyReadByMe) {
      socket.emit("readMessage", {
        messageId: msg.id,
        workspaceId: id,
      });
    }
  }, [inView, alreadyReadByMe, msg.id, id, socket]);

  const handleToggleExpand = () => setExpanded(!expanded);


  return (
    <>
      <div
        ref={ref}
        className={`flex mb-3 items-end ${isSender ? "justify-end" : "justify-start"
          }`}
      >
        {!isSender && (
          <Avatar className="w-8 h-8 mr-1">
            <AvatarImage
              src={
                msg.Sender?.imageUrl
                  ? `${BASE_IMAGE}${msg.Sender.imageUrl}`
                  : ""
              }
              alt={msg.Sender?.name || "User"}
            />
            <AvatarFallback>
              {msg.Sender?.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}

        {["image", "video", "audio"].includes(msg.type) ? (
          <div 
            className={`space-y-2 bg-gray-200 p-3 text-sm rounded-2xl max-w-[75%] relative ${isSender
              ? "bg-gray-600 text-white rounded-br-none"
              : "bg-muted text-black rounded-bl-none"
              }`}
          >
            {msg.type === "image" && (
              <Image
                src={`${BASE_IMAGE}${msg.message_file_url}`}
                alt="Uploaded Image"
                className="mt-2 rounded-md max-w-full"
                width={400}
                height={400}
              />
            )}
            {msg.type === "video" && (
              <VideoPlayer src={`${BASE_IMAGE}${msg.message_file_url}`} />
            )}
            {msg.type === "audio" && (
            <AudioPlayer src={`${BASE_IMAGE}${msg.message_file_url}`} />
            )}
            <p className="whitespace-pre-wrap break-words">
              {expanded || msg.message_text.length <= 250
                ? msg.message_text
                : msg.message_text.slice(0, 250) + "..."}
            </p>
            <div className="text-[10px] text-right text-gray-500 mt-1 flex items-center justify-end gap-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}

              {isSender && (
                <MessageReadStatus
                  message={msg}
                  allRead={msg?.allRead}
                />
              )}
            </div>
          </div>
        ) : (
          <div
            className={`p-3 text-sm rounded-2xl max-w-[75%] relative ${isSender
              ? "bg-primary text-white rounded-br-none"
              : "bg-muted text-black rounded-bl-none"
              }`}
          >
            <p className="whitespace-pre-wrap break-words">
              {expanded || msg.message_text.length <= 250
                ? msg.message_text
                : msg.message_text.slice(0, 250) + "..."}
            </p>
            {msg.message_text.length > 250 && (
              <button
                onClick={handleToggleExpand}
                className="text-xs mt-1 cursor-pointer"
              >
                {expanded ? "See less" : "See more"}
              </button>
            )}
            <div className="text-[10px] text-right text-gray-300 mt-1 flex items-center justify-end gap-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}

              {isSender && (
                <MessageReadStatus
                  message={msg}
                  allRead={msg?.allRead}
                />
              )}
            </div>
          </div>
        )}

        {isSender && (
          <Avatar className="w-8 h-8 ml-1">
            <AvatarImage
              src={
                msg.Sender?.imageUrl
                  ? `${BASE_IMAGE}${msg.Sender.imageUrl}`
                  : ""
              }
              alt={msg.Sender?.name || "User"}
            />
            <AvatarFallback>
              {msg.Sender?.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </>
  );
};

export default Message;
