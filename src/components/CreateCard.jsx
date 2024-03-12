import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import html2canvas from 'html2canvas';
import Web3 from 'web3';
import YourSmartContractABI from './ABI.json';
import { useNavigate } from 'react-router-dom';
import.meta.env;

function CreateCard({ walletAddress }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [socialMedia, setSocialMedia] = useState([]);
  const [githubUsername, setGithubUsername] = useState('');
  const [inputGithubUsername, setInputGithubUsername] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    interests: "",
    githubUsername: "",
    socialMedia: []
  });
  const [profilePic, setProfilePic] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [isMinting, setIsMinting] = useState(false); // State to control mint button visibility
  const web3 = new Web3(window.ethereum);
  const [userName, setUserName] = useState(''); // Add state for user name

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.enable();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'githubUsername') {
      setInputGithubUsername(value);
    }
  };

  const addSocialMediaField = () => {
    setSocialMedia(prev => [...prev, { name: "", link: "" }]);
  };

  const handleSocialMediaChange = (index, key, value) => {
    const updatedSocialMedia = socialMedia.map((item, idx) =>
      index === idx ? { ...item, [key]: value } : item
    );
    setSocialMedia(updatedSocialMedia);
  };

  useEffect(() => {
    if (inputGithubUsername) {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`https://api.github.com/users/${inputGithubUsername}`, {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            },
          });
          setProfilePic(response.data.avatar_url);
          setGithubUsername(inputGithubUsername); // Update githubUsername state with the input value
        } catch (error) {
          console.error("Error fetching GitHub profile:", error);
          // Handle error or set a default image
        }
      };
      fetchUserProfile();
    } else {
      setProfilePic(''); // Reset profilePic when input is empty
    }
  }, [inputGithubUsername]);

  const removeSocialMediaField = (index) => {
    setSocialMedia(socialMedia.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (data) => {
    // Assuming 'data' contains the form data, including the 'name' field
    setUserName(data.name); // Update the global userName state

    // Update formData.githubUsername with the githubUsername state
    setFormData(prevState => ({
      ...prevState,
      githubUsername
    }));

    const element = document.getElementById('card-preview');
    const canvas = await html2canvas(element);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    const file = new File([blob], "card-image.png", { type: "image/png" });
    const formData = new FormData();
    formData.append('file', file);

    const pinataEndpoint = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const headers = {
      pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
      pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
    };

    try {
      const imageResponse = await axios.post(pinataEndpoint, formData, {
        headers: {
          ...headers,
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        }
      });

      const imageIpfsUrl = `https://gateway.pinata.cloud/ipfs/${imageResponse.data.IpfsHash}`;

      const metadata = {
        name: data.name,
        description: "A brief description here",
        image: imageIpfsUrl,
        attributes: [
          { trait_type: "Role", value: data.role },
          { trait_type: "Interests", value: data.interests },
        ]
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" });
      const metadataFormData = new FormData();
      metadataFormData.append('file', metadataFile);

      const metadataResponse = await axios.post(pinataEndpoint, metadataFormData, {
        headers: {
          ...headers,
          'Content-Type': `multipart/form-data; boundary=${metadataFormData._boundary}`,
        }
      });
      console.log('Metadata added succesfully:', metadataResponse.data);
      const metadataIpfsUrl = `https://gateway.pinata.cloud/ipfs/${metadataResponse.data.IpfsHash}`;
      setIpfsUrl(metadataIpfsUrl);
      setIsMinting(true); // Show the mint button
      // Assuming mintNFT function exists and works correctly
      // await mintNFT(metadataIpfsUrl);
    } catch (error) {
      console.error('Error adding card or metadata:', error);
    }
  };

  const mintNFT = async (metadataIpfsUrl) => {
    const contract = new web3.eth.Contract(YourSmartContractABI, import.meta.env.VITE_SMART_CONTRACT_ADDRESS);
    const accounts = await web3.eth.getAccounts();
    try {
      await contract.methods.mintCard(accounts[0], metadataIpfsUrl).send({ from: accounts[0] });
      console.log('NFT minted successfully!');
      navigate('/mint-success'); // Redirect to MintSuccess page
    } catch (error) {
      console.error('Error minting NFT:', error);
    }
  };

  if (!walletAddress) {
    return <p>Please connect your wallet to create a card.</p>;
  }

  // Render the form if the wallet is connected
  return (
    <>
      <div className="bg-orange-100 font-serif min-h-screen flex justify-center">
        <div className="w-1/2">
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto mt-8 p-8 bg-white bg-opacity-50 shadow-md shadow-black rounded-lg border border-gray-300">
            {/* Name input */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input {...register("name", { required: true })} id="name" name="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker bg-white bg-opacity-50" placeholder="Your Name..." value={formData.name} onChange={handleInputChange}/>
              {errors.name && <span className="text-red-500">Name is required</span>}
            </div>

            {/* Other input fields... */}
            {/* Role input */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
              <input {...register("role", { required: true })} id="role" name="role" className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker bg-white bg-opacity-50" placeholder="Your Role..." value={formData.role} onChange={handleInputChange} />
              {errors.role && <span className="text-red-500">Role is required</span>}
            </div>

            {/* Interests input */}
            <div className="mb-4">
              <label htmlFor="interests" className="block text-gray-700 text-sm font-bold mb-2">Interests:</label>
              <input {...register("interests", { required: true })} id="interests" name="interests" className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker bg-white bg-opacity-50" placeholder="Your Interests..." value={formData.interests} onChange={handleInputChange} />
              {errors.interests && <span className="text-red-500">Interests are required</span>}
            </div>

            {/* GitHub Username input */}
            <div className="mb-4">
              <label htmlFor="githubUsername" className="block text-gray-700 text-sm font-bold mb-2">GitHub Username:</label>
              <input {...register("githubUsername", { required: true })} id="githubUsername" name="githubUsername" className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker bg-white bg-opacity-50" placeholder="GitHub Username..." value={formData.githubUsername} onChange={handleInputChange} />
              {errors.githubUsername && <span className="text-red-500">GitHub username is required</span>}
            </div>

            {/* Social Media Fields */}
            {socialMedia.map((social, index) => (
              <div key={index} className="mb-4 flex space-x-4">
                <input type="text" placeholder="Social Media Name" className="w-1/2 p-2 border bg-blue-50 border-gray-300 rounded-md" value={social.name} onChange={(e) => handleSocialMediaChange(index, "name", e.target.value)} />
                <input type="text" placeholder="Social Media Link" className="w-1/2 p-2 border bg-blue-50 border-gray-300 rounded-md" value={social.link} onChange={(e) => handleSocialMediaChange(index, "link", e.target.value)} />
                {socialMedia.length > 1 && (
                  <button type="button" onClick={() => removeSocialMediaField(index)} className="bg-red-500 text-white font-bold py-1 px-2 rounded">X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSocialMediaField} className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Social Media</button>

            {/* Submit button */}
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Add Your E-Card</button>
          </form>
        </div>

        {/* Card Preview */}
        <div id="card-preview" className="w-1/2">
          {formData && (
            <div className="bg-blue-900 mt-28 max-w-sm mx-auto mb-8 h-48 w-112 rounded-lg overflow-hidden font-serif text-white flex items-center shadow-2xl">
              <img
                className="mt-3 w-28 h-28 rounded-full mr-4 ml-4" 
                src={profilePic}
                alt="GitHub Avatar"
              />
              <div className="px-4 py-6">
                <div className="font-bold text-xl mb-2">{formData.name}</div>
                <p className="text-sm">
                  <b className="mr-2 mb-2">Role:</b> {formData.role}
                </p>
                <p className="text-sm">
                  <b className="mr-2 mb-2">Interests:</b> {formData.interests}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {socialMedia.map((social, index) =>
                    social.name && social.link ? (
                      <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-800 mx-2">{social.name}</a>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conditionally render the Mint button */}
        {isMinting && (
          <div className="flex justify-center mt-4">
            <button onClick={() => mintNFT(ipfsUrl)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Mint Your E-Dev Card
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CreateCard;