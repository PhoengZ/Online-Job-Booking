"use client";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OtpInput from "react-otp-input";
import { toast } from "react-toastify";

export default function confirmOtp({
  searchParams,
}: {
  searchParams: { email: string, uid: string };
}) {
  const [otp, setOtp] = useState<string>();
  const [error, setError] = useState<String | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const router = useRouter();
  const email = searchParams.email;
  const uid = searchParams.uid;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      if (otp?.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP");
        return;
      }
      setIsLoading(true);
      setError(null);
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1/auth/verify_otp`,{
        otp: otp,
        uid: uid
      })
      toast.success(`OTP verified successfully! ${otp}`);
      setIsLoading(false);
      router.push('/auth/sign-up-success');
    }catch(error: any){
      setIsLoading(false);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }else if (error instanceof Error){
        toast.error(error.message); 
      }else{
        toast.error("An unexpected error occurred. Please try again later.");
      }
    }
    
  };
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-400 via-purple-300 to-blue-400">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col justify-center items-center gap-5">
        <h2 className="text-gray-700 font-bold text-xl md:text-2xl text-center">
          ยืนยันรหัส OTP
        </h2>
        <p className="text-gray-600 font-semibold text-center text-sm md:text-base">
          เราได้ส่งรหัส 6 หลักไปที่อีเมล:
          <br className="sm:hidden" />
          <span className=" font-bold">{email}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="my-4 flex justify-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderSeparator={<span>-</span>}
              renderInput={(props) => <input {...props} />}
              inputStyle="!w-10 h-10 text-gray-600 md:!w-12 md:!h-12 text-lg md:text-xl border rounded-md text-center bg-gray-100 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" 
            />
          </div>

          <button
            type="submit"
            disabled={isLoading ? true : false}
            className="w-full mt-4 bg-purple-400 rounded-lg transition p-3 duration-300 hover:bg-purple-600 hover:outline-none
          hover:ring-2 hover:ring-blue-400 hover:ring-offset-2"
          >
            {isLoading ? "Verfying" : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
