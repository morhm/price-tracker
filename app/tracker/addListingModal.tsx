import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type FormInputs = {
  url: string;
  title: string;
}

interface AddListingModalProps {
  handleClose: () => void;
  handleAddListing: (data: FormInputs) => void;
}

export default function AddListingModal({ handleClose, handleAddListing }: AddListingModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      url: "",
      title: ""
    }
  })

  return (
    <form onSubmit={handleSubmit(handleAddListing)}>
      <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
        <div className="bg-white p-6 
        ounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Add New Listing</h2>
          <p className="text-gray-600 mb-4">Add a new listing to track for this tracker.</p>

          <input
            {...register('url', { required: true })}
            type="text"
            placeholder="Enter listing URL"
            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            {...register('title', { required: false })}
            type="text"
            placeholder="Enter listing title"
            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}