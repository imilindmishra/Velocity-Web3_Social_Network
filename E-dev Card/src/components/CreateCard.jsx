import { useForm } from "react-hook-form";
import NavBar from "./NavBar";

function CreateCard() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // Handle form submission logic here
    console.log(data);
  };

  return (
    <>
      <NavBar />
    
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto mt-8 p-8 bg-slate-50 rounded-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 text-zinc-950" htmlFor="name">
            Name
          </label>
          <input
            {...register("name", { required: true })}
            id="name"
            className="w-full border border-gray-300 p-2 rounded-md"
            placeholder= "Enter your name here"
          />
          {errors.name && <span className="text-red-500">Name is required</span>}
          
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 text-zinc-950" htmlFor="role">
            Role
          </label>
          <input
            {...register("role", { required: true })}
            id="role"
            className="w-full border border-gray-300 p-2 rounded-md"
            placeholder= "Frontend Developer, Backend Developer, etc."
          />
          {errors.role && <span className="text-red-500">Role is required</span>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 text-zinc-950" htmlFor="username">
            Username
          </label>
          <input
            {...register("username", { required: true })}
            id="username"
            className="w-full border border-gray-300 p-2 rounded-md"
            placeholder= "Enter your GitHub username here"
          />
          {errors.username && <span className="text-red-500">Username is required</span>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 text-zinc-950" htmlFor="interests">
            Interests
          </label>
          <input
            {...register("interests", { required: true })}
            id="interests"
            className="w-full border border-gray-300 p-2 rounded-md"
            placeholder= "Anything you are interested in?"
          />
          {errors.interests && <span className="text-red-500">Interests are required</span>}
        </div>

        {/* Add styling for other fields similarly */}

        <button type="submit" className="bg-blue-700 text-white mt-4 px-4 py-2 rounded-md">
          Generate Card
        </button>
      </form>
    </>
  );
}

export default CreateCard;
