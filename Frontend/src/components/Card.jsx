// import VideoCallIcon from '@mui/icons-material/VideoCall';

const ReminderCard = () => {
  const meetingTime = "02:00 PM";

  return (
    <div className="max-w-sm bg-white rounded-xl shadow-lg p-6 font-robo transition-all duration-300 ease-in-out 
    hover:scale-105 hover:shadow-2xl hover:shadow-sky-500">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-500">Reminder</h3>
        <h2 className="text-xl font-medium mt-1">Meeting with AI Global Company</h2>
        <h6 className="text-sm font-small text-gray-500"> Time: 02.00pm - 03.00pm </h6>
      </div>
      <div className="mb-4">
        <button
          className="w-full px-4 py-2 rounded-3xl font-bold text-white bg-[#51b4f2]
                     hover:from-sky-600 hover:to-sky-400 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {/* <VideoCallIcon className="w-5 h-5" /> */}
          Start Meeting - {meetingTime}
        </button>
      </div>
    </div>
  );
};

export default ReminderCard;
