// import { useEffect, useState } from "react";

// const VendorMoU = () => {
//   const [mou, setMou] = useState(null);
//   const [agree, setAgree] = useState(false);

//   useEffect(() => {
//     const docs = JSON.parse(localStorage.getItem("mouDocuments")) || [];
//     const vendor = JSON.parse(localStorage.getItem("currentVendor"));

//     const vendorMou = docs
//       .filter(d => d.vendorId == vendor?.id)
//       .sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate))[0];

//     setMou(vendorMou || null);
//   }, []);

//   const acceptMou = () => {
//     const docs = JSON.parse(localStorage.getItem("mouDocuments")) || [];

//     const updated = docs.map(d =>
//       d.id === mou.id
//         ? { ...d, status: "ACTIVE", acceptedAt: new Date().toISOString() }
//         : d
//     );

//     localStorage.setItem("mouDocuments", JSON.stringify(updated));
//     setMou(prev => ({ ...prev, status: "ACTIVE" }));
//   };

//   const rejectMou = () => {
//     const docs = JSON.parse(localStorage.getItem("mouDocuments")) || [];

//     const updated = docs.map(d =>
//       d.id === mou.id
//         ? { ...d, status: "REJECTED", rejectedAt: new Date().toISOString() }
//         : d
//     );

//     localStorage.setItem("mouDocuments", JSON.stringify(updated));
//     setMou(prev => ({ ...prev, status: "REJECTED" }));
//   };

//   if (!mou) {
//     return (
//       <div className="p-6 bg-white rounded-lg shadow">
//         <h3 className="text-lg font-semibold">MoU</h3>
//         <p className="text-red-600 mt-2">
//           ⚠ No MoU uploaded yet. Please contact admin.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-white rounded-lg shadow">

//       {mou.status === "PENDING_ACCEPTANCE" && (
//         <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
//           ⚠ Action Required: Please review and accept the MoU.
//         </div>
//       )}

//       {mou.status === "ACTIVE" && (
//         <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
//           ✅ Approved: Your MoU is active until {mou.validTill}
//         </div>
//       )}

//       {mou.status === "REJECTED" && (
//         <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
//           ❌ You rejected the MoU. Please contact admin.
//         </div>
//       )}

//       <div className="border rounded-lg p-4">
//         <h4 className="text-lg font-semibold">{mou.title}</h4>
//         <p className="text-gray-600">{mou.description}</p>

//         <p className="mt-2">
//           <strong>Valid From:</strong> {mou.validFrom}
//         </p>
//         <p>
//           <strong>Valid Till:</strong> {mou.validTill}
//         </p>

//         <div className="flex gap-3 mt-4">
//           <a
//             href={mou.fileUrl || "#"}
//             className="px-4 py-2 bg-gray-200 rounded"
//             target="_blank"
//           >
//             View MoU
//           </a>

//           <a
//             href={mou.fileUrl || "#"}
//             className="px-4 py-2 bg-blue-600 text-white rounded"
//             download
//           >
//             Download MoU
//           </a>
//         </div>

//         {mou.status === "PENDING_ACCEPTANCE" && (
//           <div className="mt-4">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={agree}
//                 onChange={() => setAgree(!agree)}
//               />
//               I have read and agree to the MoU
//             </label>

//             <div className="flex gap-3 mt-3">
//               <button
//                 disabled={!agree}
//                 onClick={acceptMou}
//                 className={`px-4 py-2 rounded ${
//                   agree
//                     ? "bg-green-600 text-white"
//                     : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 }`}
//               >
//                 Accept MoU
//               </button>

//               <button
//                 onClick={rejectMou}
//                 className="px-4 py-2 bg-red-600 text-white rounded"
//               >
//                 Reject MoU
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

//export default VendorMoU;

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const VendorMoU = () => {
  const [mou, setMou] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔴 FIX 1: your vendor object uses `id`, NOT `_id`
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  useEffect(() => {
    const fetchMou = async () => {
      try {
        // 🔴 FIX 2: correct backend route
       const res = await axios.get(
  `http://localhost:5006/vendor/${vendor?.id}/mou`
);



        if (res.data.success) {
          setMou(res.data.mou);
        } else {
          setMou(null);
        }
      } catch (err) {
        console.error("MoU fetch error:", err);
        setMou(null);
      } finally {
        setLoading(false);
      }
    };

    // 🔴 FIX 3: use vendor.id not vendor._id
    if (vendor?.id) fetchMou();
    else setLoading(false);
  }, [vendor?.id]);

  const handleAccept = async () => {
    try {
      // 🔴 FIX 4: correct backend route
      const res = await axios.post(
  `http://localhost:5006/vendor/${vendor?.id}/mou/accept`
);



      if (res.data.success) {
        toast.success("MoU accepted successfully!");
        setMou((prev) => ({
            ...prev,
            mou_accepted: true,
            mou_status: "ACTIVE",
            mou_accepted_at: new Date().toISOString(),
            }));

      }
    } catch (err) {
      console.error("Accept MoU error:", err);
      toast.error("Failed to accept MoU");
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading MoU...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-3">MoU</h3>

      {!mou || !mou.mou_file ? (
  <p className="text-red-500 flex items-center gap-2">
    ⚠️ No MoU uploaded yet. Please contact admin.
  </p>
) : (
  <>
    <p className="mb-4 text-gray-700">
      Memorandum of Understanding uploaded by admin.
    </p>

    <div className="mb-4 text-sm text-gray-600">
      <p>
        <b>Effective From:</b>{" "}
        {new Date(mou.mou_effective_from).toLocaleDateString()}
      </p>
      <p>
        <b>Expires At:</b>{" "}
        {new Date(mou.mou_expires_at).toLocaleDateString()}
      </p>
      <p>
        <b>Status:</b>{" "}
        <span className="font-semibold capitalize">
          {mou.mou_status}
        </span>
      </p>
    </div>

          {/* 🔴 FIX 5: correct download URL */}
          <a
  href={`http://localhost:5006/${mou.mou_file}`}
  target="_blank"
  rel="noopener noreferrer"

            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-3"
            >
            Download MoU
            </a>


          {/* ACCEPT */}
          {!mou.mou_accepted ? (
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Accept MoU
            </button>
          ) : (
            <span className="ml-3 text-green-600 font-semibold">
              ✅ MoU Accepted
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default VendorMoU;
