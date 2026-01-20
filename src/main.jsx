// v3 deployment
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Wand2, Upload, Image as ImageIcon, Sparkles, CreditCard, Download, X } from 'lucide-react';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('western-animation');
  const [imageSize, setImageSize] = useState('standard');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(10); // Start with 10 free credits
  const [showPurchase, setShowPurchase] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [userId] = useState(() => {
    // Generate or retrieve user ID
    let id = localStorage.getItem('userId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', id);
    }
    return id;
  });
  const fileInputRef = useRef(null);

  const styles = [
    { id: 'western-animation', name: 'Western Animation' },
    { id: 'japanese-anime', name: 'Japanese Anime' },
    { id: 'korean-manhwa', name: 'Korean Manhwa' },
    { id: 'comic-book', name: 'Comic Book' },
    { id: 'cartoon-cute', name: 'Cute Cartoon' },
    { id: 'vintage-cartoon', name: 'Vintage Cartoon' }
  ];

  const sizes = [
    { id: 'standard', label: 'Standard (1024×1024)', credits: 1 },
    { id: 'large', label: 'Large (1024×1536)', credits: 2 },
    { id: 'premium', label: 'Premium HD', credits: 3 }
  ];

  const creditPackages = [
    { credits: 10, price: 1.99, popular: false },
    { credits: 50, price: 7.99, popular: true },
    { credits: 100, price: 12.99, popular: false },
    { credits: 500, price: 49.99, popular: false }
  ];

  // Load credits from backend
  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const apiUrl = 'https://stylesnap-ai.onrender.com';
      const response = await fetch(`${apiUrl}/api/credits/${userId}`);
      const data = await response.json();
      setCredits(data.credits || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    const requiredCredits = sizes.find(s => s.id === imageSize).credits;
    
    if (credits < requiredCredits) {
      setShowPurchase(true);
      return;
    }

    if (activeTab === 'text' && !prompt.trim()) {
      alert('Please enter a description for your image');
      return;
    }

    if (activeTab === 'image' && !uploadedImage) {
      alert('Please upload an image');
      return;
    }

    setIsGenerating(true);

    try {
      let response;
      const apiUrl = 'https://stylesnap-ai.onrender.com';
      
      if (activeTab === 'text') {
        // Text to image
        response = await fetch(`${apiUrl}/api/generate/text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            prompt,
            style: selectedStyle,
            size: imageSize,
          }),
        });
      } else {
        // Image to image
        const formData = new FormData();
        formData.append('image', uploadedImage);
        formData.append('userId', userId);
        formData.append('style', selectedStyle);
        formData.append('size', imageSize);
        formData.append('prompt', prompt);

        response = await fetch(`${apiUrl}/api/generate/image`, {
          method: 'POST',
          body: formData,
        });
      }

      const data = await response.json();

      if (response.ok) {
        setGeneratedImage(data.imageUrl);
        setCredits(data.remainingCredits);
      } else {
        if (response.status === 402) {
          setShowPurchase(true);
        } else {
          alert(data.error || 'Failed to generate image');
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePurchaseCredits = async (packageData) => {
    try {
      const apiUrl = 'https://stylesnap-ai.onrender.com';
      const response = await fetch(`${apiUrl}/api/purchase/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          credits: packageData.credits,
          price: packageData.price,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase. Please try again.');
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stylesnap-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image');
    }
  };

  // Example showcase images (replace with your generated examples)
  const showcaseImages = [
    { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop', style: 'Anime Style' },
    { url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop', style: 'Comic Book' },
    { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', style: 'Western Animation' },
    { url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop', style: 'Cute Cartoon' },
    { url: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400&h=400&fit=crop', style: 'Korean Manhwa' },
    { url: 'https://images.unsplash.com/photo-1618556658017-570919234238?w=400&h=400&fit=crop', style: 'Vintage Cartoon' },
  ];

  const [showLanding, setShowLanding] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-sans">
      {/* Animated Landing Hero */}
      {showLanding && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 z-50 flex items-center justify-center overflow-hidden">
          {/* Animated Background Photos */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-6 gap-4 p-8 animate-scroll">
              {[...showcaseImages, ...showcaseImages].map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden transform hover:scale-110 transition-transform duration-300"
                  style={{
                    animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                >
                  <img src={img.url} alt={img.style} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <div className="mb-8 inline-block">
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-3xl animate-bounce-slow">
                <Sparkles className="w-20 h-20 text-white" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight animate-fade-in">
              StyleSnap AI
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/90 mb-8 font-bold animate-fade-in-delay">
              Transform Your Imagination into Art
            </p>
            
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto animate-fade-in-delay-2">
              Create stunning images in anime, cartoon, and comic styles. Upload your photos or describe your vision.
            </p>

            {/* Floating Example Cards */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {showcaseImages.slice(0, 3).map((img, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/30 transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <img src={img.url} alt={img.style} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold text-purple-600 shadow-lg whitespace-nowrap">
                    {img.style}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowLanding(false)}
              className="group relative px-12 py-5 bg-white text-purple-600 rounded-full font-black text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse-slow"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Creating
                <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>

            <p className="mt-6 text-white/60 text-sm animate-fade-in-delay-3">
              ✨ Start with 10 free credits • No credit card required
            </p>
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            @keyframes scroll {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.8s ease-out; }
            .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.2s both; }
            .animate-fade-in-delay-2 { animation: fade-in 0.8s ease-out 0.4s both; }
            .animate-fade-in-delay-3 { animation: fade-in 0.8s ease-out 0.6s both; }
            .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
            .animate-bounce-slow { animation: bounce 2s infinite; }
            .animate-pulse-slow { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          `}</style>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 rounded-2xl rotate-6 shadow-lg">
                <Sparkles className="w-7 h-7 text-white -rotate-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                  StyleSnap AI
                </h1>
                <p className="text-xs text-gray-500 font-medium">Transform your imagination</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>{credits} Credits</span>
              </div>
              <button
                onClick={() => setShowPurchase(true)}
                className="bg-white hover:bg-purple-50 border-2 border-purple-600 text-purple-600 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 shadow-sm"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Tab Selection */}
            <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
              <div className="flex border-b border-purple-100">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 px-6 py-4 font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === 'text'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Text to Image</span>
                </button>
                <button
                  onClick={() => setActiveTab('image')}
                  className={`flex-1 px-6 py-4 font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === 'image'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Image to Image</span>
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'text' ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">
                      Describe your image
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      maxLength={200}
                      placeholder="A cheerful cat wearing a wizard hat, casting sparkles..."
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-2xl focus:border-purple-600 focus:ring-0 resize-none font-medium text-gray-700 placeholder-gray-400 transition-colors duration-200"
                      rows={4}
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">
                        {prompt.length}/200 characters
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">
                      Upload your image
                    </label>
                    
                    {uploadPreview ? (
                      <div className="relative">
                        <img
                          src={uploadPreview}
                          alt="Upload preview"
                          className="w-full h-64 object-cover rounded-2xl border-2 border-purple-200"
                        />
                        <button
                          onClick={removeUploadedImage}
                          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-3 border-dashed border-purple-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-all duration-200"
                      >
                        <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-700 mb-1">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {uploadedImage && (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Add description (optional)
                        </label>
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          maxLength={200}
                          placeholder="Keep the pose but make it more magical..."
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-2xl focus:border-purple-600 focus:ring-0 resize-none font-medium text-gray-700 placeholder-gray-400"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Style Selection */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Choose your style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2 ${
                      selectedStyle === style.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Image size
              </label>
              <div className="space-y-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setImageSize(size.id)}
                    className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2 flex items-center justify-between ${
                      imageSize === size.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                        : 'bg-white text-gray-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <span>{size.label}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      imageSize === size.id ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {size.credits} {size.credits === 1 ? 'credit' : 'credits'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                  <span>Creating Magic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-800">Preview</h2>
                {generatedImage && (
                  <button
                    onClick={downloadImage}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>
              
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden border-2 border-purple-200 flex items-center justify-center">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8">
                    <ImageIcon className="w-24 h-24 text-purple-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold text-lg mb-2">
                      Your image will appear here
                    </p>
                    <p className="text-gray-400 text-sm">
                      {activeTab === 'text' 
                        ? 'Enter a description and generate!'
                        : 'Upload an image and generate!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Purchase Credits Modal */}
      {showPurchase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Buy Credits
                </h2>
                <button
                  onClick={() => setShowPurchase(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.credits}
                    className={`relative p-6 rounded-2xl border-3 transition-all duration-200 hover:scale-105 cursor-pointer ${
                      pkg.popular
                        ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50'
                        : 'border-purple-200 bg-white hover:border-purple-400'
                    }`}
                    onClick={() => handlePurchaseCredits(pkg)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                          BEST VALUE
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-800 mb-2">
                        {pkg.credits}
                      </div>
                      <div className="text-sm font-bold text-gray-600 mb-4">
                        Credits
                      </div>
                      <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        ${pkg.price}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        ${(pkg.price / pkg.credits).toFixed(3)} per credit
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-600 font-medium text-center">
                  💳 Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
