import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import NavBar from "./NavBar";

function CreateCard({ onDataChange }) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [socialMedia, setSocialMedia] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    interests: "",
    githubUsername: "",
    socialMedia: []
  });

    const [profilePic, setProfilePic] = useState("");

    useEffect(() => {
    if (formData.githubUsername) {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`https://api.github.com/users/${formData.githubUsername}`);
          setProfilePic(response.data.avatar_url);
        } catch (error) {
          console.error("Error fetching GitHub profile:", error);
          // Handle error or set a default image
        }
      };
      fetchUserProfile();
    }
  }, [formData.githubUsername]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  function addSocialMediaField() {
    setSocialMedia([
      ...socialMedia,
      { name: "", link: "" }
    ]);
  }

  const handleSocialMediaChange = (index, key, value) => {
    const updatedSocialMedia = [...socialMedia];
    updatedSocialMedia[index][key] = value;
    setSocialMedia(updatedSocialMedia);
  };

  const removeSocialMediaField = (index) => {
    const updatedSocialMedia = [...socialMedia];
    updatedSocialMedia.splice(index, 1);
    setSocialMedia(updatedSocialMedia);
  };

  const onSubmit = (data) => {
    onDataChange({ ...data, socialMedia });
  };

  const showRemoveButton = socialMedia.length > 0;

  return (
    <>
    <NavBar />
      <div className="flex justify-center">
        <div className="w-1/2">
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto mt-8 p-8 bg-white shadow-md rounded-lg">
          <div className="mb-4">
            <input
              {...register("name", { required: true })}
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              placeholder="Your Name..."
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="text-red-500">Name is required</span>}
          </div>
          {/* Other input fields go here */}
          <div className="mb-4">
            <input
              {...register("role", { required: true })}
              id="role"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              placeholder="Description: Full Stack/Frontend/Backend/etc...."
              value={formData.role}
              onChange={handleInputChange}
            />
            {errors.role && <span className="text-red-500">Role is required</span>}
          </div>
          <div className="mb-4">
            <input
              {...register("interests", { required: true })}
              id="interests"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              placeholder="Your Interests..."
              value={formData.interests}
              onChange={handleInputChange}
            />
            {errors.interests && <span className="text-red-500">Interests are required</span>}
          </div>
          <div className="mb-4">
            <input
              {...register("githubUsername", { required: true })}
              id="githubUsername"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
              placeholder="Your github username... (card image will be same as github avatar)"
              value={formData.githubUsername}
              onChange={handleInputChange}
            />
            {errors.githubUsername && <span className="text-red-500">GitHub username is required</span>}
          </div>
          <div className="mb-4">
            Socials
            <button
              type="button"
              onClick={addSocialMediaField}
              className="bg-blue-600 hover:bg-blue-700 text-white font-normal text-sm px-2 rounded mx-2 "
            >
              Add +
            </button>
          </div>
          {socialMedia.map((social, index) => (
            <div key={index} className="mb-4 flex space-x-4">
              <input
                type="text"
                placeholder="Social Media Name"
                className="w-1/2 p-2 border border-gray-300 rounded-md"
                value={social.name}
                onChange={(e) => handleSocialMediaChange(index, "name", e.target.value)}
              />
              <input
                type="text"
                placeholder="Social Media Link"
                className="w-1/2 p-2 border border-gray-300 rounded-md"
                value={social.link}
                onChange={(e) => handleSocialMediaChange(index, "link", e.target.value)}
              />
            </div>
          ))}
          {showRemoveButton && (
            <button
              type="button"
              onClick={() => removeSocialMediaField(socialMedia.length - 1)}
              className="bg-blue-900  text-white font-normal text-sm px-2 mx-2 rounded mb-4"
            >
              Remove
            </button>
          )}
          <button type="submit" className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">
            Add Your E-Card
          </button>
        </form>
      </div>
      <div className="w-1/2">
        {formData && (
          <div className="bg-indigo-950 mt-28 max-w-sm mx-auto mb-8 h-48 w-112 shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 py-6">
              <img
                  className="w-24 h-24 rounded-full mr-4"
                  src={profilePic}
                  alt="GitHub Avatar"
              />
              <div className="text-white font-bold text-xl mb-2">{formData.name}</div>
              <p className="text-white text-sm">{formData.role}</p>
              <p className="text-white text-sm">{formData.interests}</p>
              <div className="flex mt-4">
                
                <div>
                  {formData.socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 mr-2"
                    >
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  );
}

export default CreateCard;
