document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const fileList = document.getElementById("fileList");
    const dropZone = document.getElementById("dropZone");
    const mergeBtn = document.getElementById("mergeBtn");
    const progressWrapper = document.getElementById("progressWrapper");
    const progressBar = document.getElementById("progressBar");

    let filesArray = [];

    if (fileInput) {
        fileInput.addEventListener("change", function (e) {
            console.log("File input changed, files:", e.target.files);
            filesArray = [...e.target.files];
            renderFiles();
        });
    }

    if (dropZone) {
        dropZone.addEventListener("dragover", e => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("dragover");
        });

        dropZone.addEventListener("drop", e => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
            filesArray = [...e.dataTransfer.files];
            renderFiles();
        });
    }

    function handleFiles() {
        filesArray = [...filesArray, ...fileInput.files];
        renderFiles();
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function removeFile(index) {
        filesArray.splice(index, 1);
        renderFiles();
    }
    // Expose to window so onclick works
    window.removeFile = removeFile;

    function renderFiles() {
        if (!fileList || !mergeBtn) return;

        // Hide original list to use our custom grid
        fileList.style.display = 'none'; // Ensure the UL is hidden

        // Find or create grid container
        let gridContainer = document.querySelector(".file-grid");
        if (!gridContainer) {
            gridContainer = document.createElement("div");
            gridContainer.className = "file-grid";
            // Insert after the dropZone using parentNode
            const parent = document.getElementById("mainMergeUI");
            if (parent) {
                // Insert before the merge button, or just append to parent if button not found
                if (mergeBtn.parentNode === parent) {
                    parent.insertBefore(gridContainer, mergeBtn);
                } else {
                    parent.appendChild(gridContainer);
                }
            }
        }
        gridContainer.innerHTML = "";

        if (filesArray.length === 0) {
            gridContainer.style.display = 'none';
            mergeBtn.classList.add("d-none");
            // Show dropzone again if it was hidden (though currently we keep it visible usually)
            return;
        }

        gridContainer.style.display = 'grid';
        mergeBtn.classList.remove("d-none");

        // Render File Cards
        filesArray.forEach((file, index) => {
            const card = document.createElement("div");
            // No column classes needed as grid handles it

            card.innerHTML = `
                <div class="file-card-premium">
                    <button class="remove-btn-premium" onclick="removeFile(${index})" title="Remove">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    
                    <div class="premium-file-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>

                    <div class="file-info-premium">
                        <div class="file-name-premium" title="${file.name}">${file.name}</div>
                        <div class="file-size-premium">${formatBytes(file.size)}</div>
                    </div>
                </div>
            `;
            gridContainer.appendChild(card);
        });

        // "Add More" Card
        const addMoreCard = document.createElement("div");
        addMoreCard.innerHTML = `
            <div class="file-card-premium add-more-card" onclick="document.getElementById('fileInput').click()">
                <div class="premium-file-icon" style="background: #F0FDF4; color: var(--primary); border-style: dashed;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <div class="file-info-premium">
                    <div class="file-name-premium" style="color: var(--primary);">Add more files</div>
                </div>
            </div>
        `;
        gridContainer.appendChild(addMoreCard);
    }


    window.submitForm = function () {
        // UI Elements
        const mainUI = document.getElementById("mainMergeUI");
        const progressModal = document.getElementById("progressModal");
        const successUI = document.getElementById("successUI");
        const progressBar = document.getElementById("progressBar");
        const progressPercent = document.getElementById("progressPercent");
        const uploadSpeed = document.getElementById("uploadSpeed");
        const timeRemaining = document.getElementById("timeRemaining");
        const downloadBtn = document.getElementById("downloadBtn");

        if (!filesArray.length) {
            alert("Please select PDF files first");
            return;
        }

        // Show Progress Modal
        progressModal.classList.remove("d-none");

        const formData = new FormData();
        filesArray.forEach(f => formData.append("pdfs", f));

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/merge-pdf");
        xhr.responseType = "blob";

        let startTime = new Date().getTime();
        let lastLoaded = 0;

        xhr.upload.onprogress = e => {
            if (e.lengthComputable) {
                // Calculate percentage
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + "%";
                progressPercent.innerText = percent + "%";

                // Calculate speed
                const currentTime = new Date().getTime();
                const timeDiff = (currentTime - startTime) / 1000; // seconds

                if (timeDiff > 0.5) { // Update every 0.5s for stability
                    const loadedDiff = e.loaded - lastLoaded;
                    const speedBytes = loadedDiff / timeDiff; // bytes/sec
                    const speedKB = (speedBytes / 1024).toFixed(0);

                    uploadSpeed.innerText = speedKB + " KB/S";

                    // Calculate Time Remaining
                    const remainingBytes = e.total - e.loaded;
                    const secondsLeft = (remainingBytes / speedBytes).toFixed(0);
                    timeRemaining.innerText = secondsLeft + " SECONDS LEFT";

                    startTime = currentTime;
                    lastLoaded = e.loaded;
                }
            }
        };

        xhr.onload = () => {
            progressModal.classList.add("d-none");

            if (xhr.status === 200) {
                // Success
                mainUI.classList.add("d-none");
                successUI.classList.remove("d-none");

                const url = URL.createObjectURL(xhr.response);

                // Auto Download
                const a = document.createElement("a");
                a.href = url;
                a.download = "merged.pdf";
                a.click();

                // Setup manual download button
                downloadBtn.href = url;
                downloadBtn.download = "merged.pdf";
            } else {
                // Error handling
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const error = JSON.parse(reader.result);
                        alert("Error: " + (error.error || "Unknown error occurred"));
                    } catch (e) {
                        alert("Error: Server returned " + xhr.status);
                    }
                };
                reader.readAsText(xhr.response);
            }
        };

        xhr.onerror = () => {
            progressModal.classList.add("d-none");
            alert("Network error occurred");
        };

        xhr.send(formData);
    };

    // Split PDF page
    const splitInput = document.getElementById("splitInput");
    const splitDrop = document.getElementById("splitDrop");
    const splitOptions = document.getElementById("splitOptions");
    const splitMode = document.getElementById("splitMode");
    const pageRange = document.getElementById("pageRange");

    let splitFile = null;

    if (splitInput) {
        splitInput.addEventListener("change", () => {
            splitFile = splitInput.files[0];
            if (splitOptions) splitOptions.classList.remove("d-none");
        });
    }

    if (splitDrop) {
        splitDrop.addEventListener("dragover", e => e.preventDefault());

        splitDrop.addEventListener("drop", e => {
            e.preventDefault();
            splitFile = e.dataTransfer.files[0];
            if (splitOptions) splitOptions.classList.remove("d-none");
        });
    }

    if (splitMode) {
        splitMode.addEventListener("change", () => {
            if (pageRange) pageRange.classList.toggle("d-none", splitMode.value !== "range");
        });
    }

    window.submitSplit = function () {
        const formData = new FormData();
        formData.append("pdf", splitFile);
        formData.append("mode", splitMode.value);
        formData.append("range", pageRange.value);

        fetch("/split-pdf", {
            method: "POST",
            body: formData
        })
            .then(res => res.blob())
            .then(blob => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "split_pdfs.zip";
                a.click();
            });
    };

    // Compress PDF page
    const compressInput = document.getElementById("compressInput");
    const compressDrop = document.getElementById("compressDrop");
    const compressOptions = document.getElementById("compressOptions");

    let compressFile = null;

    if (compressInput) {
        compressInput.addEventListener("change", () => {
            compressFile = compressInput.files[0];
            if (compressOptions) compressOptions.classList.remove("d-none");
        });
    }

    if (compressDrop) {
        compressDrop.addEventListener("dragover", e => e.preventDefault());

        compressDrop.addEventListener("drop", e => {
            e.preventDefault();
            compressFile = e.dataTransfer.files[0];
            if (compressOptions) compressOptions.classList.remove("d-none");
        });
    }

    function showPreview() {
        const formData = new FormData();
        formData.append("pdf", compressFile);
        fetch("/preview", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.log("Preview not available: " + data.error);
                    return;
                }
            });
    }

    window.submitCompress = function () {
        if (!compressFile) {
            alert("Please select a PDF file first");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", compressFile);
        const level = document.getElementById("compressionLevel");
        if (!level) {
            alert("Compression level selector not found");
            return;
        }
        formData.append("level", level.value);

        fetch("/compress-pdf", {
            method: "POST",
            body: formData
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => {
                        throw new Error(data.error || "Server error: " + res.statusText);
                    }).catch(() => {
                        throw new Error("Server error: " + res.statusText);
                    });
                }
                return res.blob();
            })
            .then(blob => {
                if (blob.size === 0) {
                    throw new Error("Downloaded file is empty");
                }
                console.log("Compress successful, blob size:", blob.size);
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "compressed.pdf";
                a.click();
            })
            .catch(err => {
                console.error("Compress error:", err);
                alert("Error compressing PDF: " + err.message);
            });
    };

    // PDF to Image conversion
    const pdfInput = document.getElementById("pdfInput");
    const pdfDrop = document.getElementById("pdfDrop");
    const convertOptions = document.getElementById("convertOptions");
    const imageFormat = document.getElementById("imageFormat");

    let pdfFile = null;

    if (pdfInput) {
        pdfInput.addEventListener("change", () => {
            pdfFile = pdfInput.files[0];
            if (convertOptions) convertOptions.classList.remove("d-none");
        });
    }

    if (pdfDrop) {
        pdfDrop.addEventListener("dragover", e => e.preventDefault());

        pdfDrop.addEventListener("drop", e => {
            e.preventDefault();
            pdfFile = e.dataTransfer.files[0];
            if (convertOptions) convertOptions.classList.remove("d-none");
        });
    }

    window.submitConvert = function () {
        const formData = new FormData();
        formData.append("pdf", pdfFile);
        formData.append("format", imageFormat.value);

        fetch("/convert-pdf-to-images", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert("Error: " + data.error);
                    return;
                }
            })
            .catch(err => alert("Error: " + err));
    };

    // PDF to JPG conversion
    window.submitConvertToJpg = function () {
        const formData = new FormData();
        formData.append("pdf", pdfFile);

        const button = event.target;
        button.disabled = true;
        button.innerText = "Converting...";

        fetch("/convert-pdf-to-jpg", {
            method: "POST",
            body: formData
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => { throw new Error(data.error || "Conversion failed"); });
                }
                return res.blob().then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = blob.type === 'application/zip' ? 'pdf_to_jpg.zip' : 'page_1.jpg';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                    button.disabled = false;
                    button.innerText = "Convert to JPG";
                });
            })
            .catch(err => {
                alert("Error: " + err.message);
                button.disabled = false;
                button.innerText = "Convert to JPG";
            });
    };

    // PDF to PNG conversion
    window.submitConvertToPng = function () {
        const formData = new FormData();
        formData.append("pdf", pdfFile);

        const button = event.target;
        button.disabled = true;
        button.innerText = "Converting...";

        fetch("/convert-pdf-to-png", {
            method: "POST",
            body: formData
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => { throw new Error(data.error || "Conversion failed"); });
                }
                return res.blob().then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = blob.type === 'application/zip' ? 'pdf_to_png.zip' : 'page_1.png';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                    button.disabled = false;
                    button.innerText = "Convert to PNG";
                });
            })
            .catch(err => {
                alert("Error: " + err.message);
                button.disabled = false;
                button.innerText = "Convert to PNG";
            });
    };

    window.toggleDark = function () {
        document.body.classList.toggle("light");
        document.body.classList.toggle("dark");
    };
});
