"use client";
import { motion } from "framer-motion";
import { Share2, Facebook, Twitter, Instagram, Linkedin, MessageCircle, Send } from "lucide-react";

const shareUrl = "https://solarizedng.vercel.app";
const shareMessage = "Win with friends, family & others 🎁";

const FloatingShareBar = () => {
  const handleShare = (platform: string) => {
    const encodedMsg = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(shareUrl);
    let shareLink = "";

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedMsg}&url=${encodedUrl}`;
        break;
      case "instagram":
        shareLink = "https://www.instagram.com/";
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedMsg}`;
        break;
      case "whatsapp":
        shareLink = `https://api.whatsapp.com/send?text=${encodedMsg}%20${encodedUrl}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`;
        break;
    }

    window.open(shareLink, "_blank");
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-50"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="bg-orange-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-orange-600"
        whileHover={{ scale: 1.1 }}
        onClick={() => {
          const container = document.getElementById("share-icons");
          if (container) container.classList.toggle("hidden");
        }}
      >
        <Share2 size={24} />
      </motion.div>

      <div id="share-icons" className="hidden flex flex-col gap-3">
        <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleShare("facebook")} className="bg-blue-600 text-white p-3 rounded-full shadow-md">
          <Facebook size={20} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleShare("twitter")} className="bg-black text-white p-3 rounded-full shadow-md">
          <Twitter size={20} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleShare("instagram")} className="bg-pink-500 text-white p-3 rounded-full shadow-md">
          <Instagram size={20} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleShare("linkedin")} className="bg-blue-700 text-white p-3 rounded-full shadow-md">
          <Linkedin size={20} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleShare("whatsapp")} className="bg-green-500 text-white p-3 rounded-full shadow-md">
          <MessageCircle size={20} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleShare("telegram")} className="bg-sky-500 text-white p-3 rounded-full shadow-md">
          <Send size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FloatingShareBar;
