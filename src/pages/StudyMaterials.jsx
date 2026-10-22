
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudyMaterials.css";

function StudyMaterials() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [materials, setMaterials] = useState([]);
const [loadingMaterials, setLoadingMaterials] = useState(true);
const [materialsError, setMaterialsError] = useState("");



async function loadMaterials() {
  try {
    setLoadingMaterials(true);
    setMaterialsError("");

    const token = sessionStorage.getItem("studygramToken");

    if (!token) {
      setMaterialsError("Please log in to view study materials.");
      return;
    }

    const response = await fetch(
      "http://localhost:5000/api/study-materials",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load study materials."
      );
    }

    setMaterials(data.materials || []);
  } catch (error) {
    setMaterialsError(
      error.message || "Unable to connect to the server."
    );
  } finally {
    setLoadingMaterials(false);
  }
}




async function handleDownload(material) {
  try {
    const token = sessionStorage.getItem("studygramToken");

    if (!token) {
      setMessage("Please log in again to download this file.");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/study-materials/${material._id}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Download failed.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = material.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    setMessage(error.message || "Unable to download the file.");
  }
}



useEffect(() => {
  loadMaterials();
}, []);

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a PDF or plain text file.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("File size must be 10 MB or less.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setMessage("");
    setSelectedFile(file);
  }

  
async function handleSubmit(event) {
  event.preventDefault();

  if (!title.trim() || !subject.trim() || !selectedFile) {
    setMessage("Please enter a title, subject, and select a file.");
    return;
  }

  try {
    setMessage("Uploading study material...");

    const token = sessionStorage.getItem("studygramToken");

    if (!token) {
      setMessage("Please log in again to upload study materials.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subject", subject.trim());
    formData.append("description", description.trim());
    formData.append("file", selectedFile);

    const response = await fetch(
      "http://localhost:5000/api/study-materials",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to upload study material.");
    }

    setMessage("Study material uploaded successfully!");
    setTitle("");
    setSubject("");
    setDescription("");
    setSelectedFile(null);

    const fileInput = document.getElementById("material-file");
    if (fileInput) fileInput.value = "";
  } catch (error) {
    setMessage(error.message || "Unable to connect to the server.");
  }
}


  return (
    <div className="study-materials-page">
      <header className="study-materials-header">
        <h2>📚 StudyGram</h2>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="study-materials-content">
        <h1>Study Materials</h1>

        <p>
          Discover and share notes, PDFs, and learning resources
          with your learning community.
        </p>

        <section className="study-materials-upload">
          <h2>📤 Upload Study Material</h2>

          <p className="study-materials-helper">
            Share useful notes and resources with fellow learners.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="study-materials-field">
              <label htmlFor="material-title">Material Title *</label>
              <input
                id="material-title"
                type="text"
                placeholder="e.g. Java OOP Notes"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="study-materials-field">
              <label htmlFor="material-subject">Subject *</label>
              <input
                id="material-subject"
                type="text"
                placeholder="e.g. Java Programming"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={80}
                required
              />
            </div>

            <div className="study-materials-field">
              <label htmlFor="material-description">
                Description (optional)
              </label>
              <textarea
                id="material-description"
                placeholder="Describe what these notes cover..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1000}
                rows={4}
              />
            </div>

            <div className="study-materials-field">
              <label htmlFor="material-file">Choose a PDF or text file *</label>
              <input
                id="material-file"
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={handleFileChange}
                required
              />
              <small>Maximum file size: 10 MB</small>
            </div>

            {selectedFile && (
              <p className="study-materials-selected-file">
                Selected: {selectedFile.name}
              </p>
            )}

            {message && (
              <p className="study-materials-message" role="status">
                {message}
              </p>
            )}

            <button className="study-materials-submit" type="submit">
              Upload Material
            </button>
          </form>
        </section>

       
<section className="study-materials-empty">
  <h2>📖 Your Learning Library</h2>

  {loadingMaterials && (
    <p>Loading study materials...</p>
  )}

  {!loadingMaterials && materialsError && (
    <p className="study-materials-message" role="alert">
      {materialsError}
    </p>
  )}

  {!loadingMaterials &&
    !materialsError &&
    materials.length === 0 && (
      <p>No study materials uploaded yet. Be the first to share!</p>
    )}

  {!loadingMaterials &&
    !materialsError &&
    materials.length > 0 && (
      <div className="study-materials-list">
        {materials.map((material) => (
          <article
            className="study-material-card"
            key={material._id}
          >
            <h3>📄 {material.title}</h3>

            <p>
              <strong>Subject:</strong> {material.subject}
            </p>

            {material.description && (
              <p>{material.description}</p>
            )}

            <p>
              <strong>Shared by:</strong>{" "}
              {material.uploadedBy?.fullName || "Unknown"}
            </p>

            <p>
              <strong>Uploaded:</strong>{" "}
              {new Date(material.createdAt).toLocaleDateString()}
            </p>

            <p>
              <strong>File:</strong> {material.filename}
            </p>

            <p>
              <strong>Size:</strong>{" "}
              {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>

            
<button
  className="study-material-download"
  onClick={() => handleDownload(material)}
>
  ⬇️ Download Material
</button>

          </article>
        ))}
      </div>
    )}
</section>

      </main>
    </div>
  );
}

export default StudyMaterials;
