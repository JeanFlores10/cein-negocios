// =====================================================
// IMAGE UPLOAD COMPONENT
// Helper para gestionar uploads de imágenes a Supabase
// =====================================================

/**
 * Clase para manejar el upload de imágenes
 */
class ImageUpload {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        // Configuración por defecto
        this.options = {
            bucket: options.bucket || 'course-images',
            folder: options.folder || '',
            maxSize: options.maxSize || 5, // MB
            allowedTypes: options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
            onUploadStart: options.onUploadStart || null,
            onUploadComplete: options.onUploadComplete || null,
            onUploadError: options.onUploadError || null,
            onRemove: options.onRemove || null
        };

        this.currentFile = null;
        this.uploadedImageData = null;

        this.init();
    }

    /**
     * Inicializar el componente
     */
    init() {
        this.render();
        this.attachEvents();
    }

    /**
     * Renderizar el HTML del componente
     */
    render() {
        this.container.innerHTML = `
            <div class="image-upload-container">
                <div class="image-upload-wrapper">
                    <input type="file" class="upload-input" accept="image/*">
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p class="upload-text">Arrastra tu imagen aquí</p>
                    <p class="upload-hint">o haz clic para seleccionar</p>
                    <button type="button" class="upload-button">
                        <i class="fas fa-image"></i> Seleccionar Imagen
                    </button>
                    <p class="upload-hint" style="margin-top: 10px;">
                        Formatos: JPG, PNG, WEBP, GIF | Máximo ${this.options.maxSize}MB
                    </p>
                </div>

                <!-- Preview Container -->
                <div class="image-preview-container">
                    <div class="image-preview-wrapper">
                        <img src="" alt="Preview" class="image-preview">
                        <div class="image-preview-info">
                            <div class="image-preview-name"></div>
                            <div class="image-preview-size"></div>
                            <div class="image-preview-actions">
                                <button type="button" class="btn-change-image">
                                    <i class="fas fa-sync-alt"></i> Cambiar
                                </button>
                                <button type="button" class="btn-remove-image">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="upload-progress">
                    <div class="upload-progress-bar">
                        <div class="upload-progress-fill"></div>
                    </div>
                    <div class="upload-progress-text">Subiendo...</div>
                </div>
            </div>
        `;
    }

    /**
     * Adjuntar eventos
     */
    attachEvents() {
        const uploadWrapper = this.container.querySelector('.image-upload-wrapper');
        const uploadInput = this.container.querySelector('.upload-input');
        const uploadButton = this.container.querySelector('.upload-button');
        const btnChange = this.container.querySelector('.btn-change-image');
        const btnRemove = this.container.querySelector('.btn-remove-image');

        // Click en el botón
        uploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            uploadInput.click();
        });

        // Click en el wrapper
        uploadWrapper.addEventListener('click', (e) => {
            if (e.target === uploadWrapper || e.target.classList.contains('upload-icon') ||
                e.target.classList.contains('upload-text') || e.target.classList.contains('upload-hint')) {
                uploadInput.click();
            }
        });

        // Cambio de archivo
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // Drag and drop
        uploadWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadWrapper.classList.add('drag-over');
        });

        uploadWrapper.addEventListener('dragleave', () => {
            uploadWrapper.classList.remove('drag-over');
        });

        uploadWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadWrapper.classList.remove('drag-over');

            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // Botón cambiar
        btnChange.addEventListener('click', (e) => {
            e.preventDefault();
            uploadInput.click();
        });

        // Botón eliminar
        btnRemove.addEventListener('click', (e) => {
            e.preventDefault();
            this.removeImage();
        });
    }

    /**
     * Manejar archivo seleccionado
     */
    handleFile(file) {
        // Validar tipo
        if (!this.options.allowedTypes.includes(file.type)) {
            this.showError('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.');
            return;
        }

        // Validar tamaño
        const maxSizeBytes = this.options.maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            this.showError(`La imagen no debe superar los ${this.options.maxSize}MB`);
            return;
        }

        this.currentFile = file;
        this.showPreview(file);
        this.uploadFile(file);
    }

    /**
     * Mostrar preview de la imagen
     */
    showPreview(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const previewContainer = this.container.querySelector('.image-preview-container');
            const previewImg = this.container.querySelector('.image-preview');
            const previewName = this.container.querySelector('.image-preview-name');
            const previewSize = this.container.querySelector('.image-preview-size');

            previewImg.src = e.target.result;
            previewName.textContent = file.name;
            previewSize.textContent = this.formatFileSize(file.size);

            previewContainer.classList.add('active');
        };

        reader.readAsDataURL(file);
    }

    /**
     * Subir archivo a Supabase
     */
    async uploadFile(file) {
        try {
            // Callback de inicio
            if (this.options.onUploadStart) {
                this.options.onUploadStart(file);
            }

            // Mostrar progress bar
            this.showProgress(0);

            // Simular progreso (Supabase no provee progreso real)
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 10;
                if (progress <= 90) {
                    this.updateProgress(progress);
                }
            }, 200);

            // Subir a Supabase
            const result = await window.supabaseCRUD.uploadImage(
                file,
                this.options.bucket,
                this.options.folder
            );

            clearInterval(progressInterval);

            if (result.success) {
                this.updateProgress(100);
                setTimeout(() => {
                    this.hideProgress();
                }, 500);

                this.uploadedImageData = result;

                // Callback de éxito
                if (this.options.onUploadComplete) {
                    this.options.onUploadComplete(result);
                }

                this.showSuccess('Imagen subida correctamente');
            } else {
                this.hideProgress();
                this.showError(result.error || 'Error al subir la imagen');

                // Callback de error
                if (this.options.onUploadError) {
                    this.options.onUploadError(result.error);
                }
            }
        } catch (error) {
            this.hideProgress();
            this.showError('Error al subir la imagen: ' + error.message);

            // Callback de error
            if (this.options.onUploadError) {
                this.options.onUploadError(error.message);
            }
        }
    }

    /**
     * Eliminar imagen
     */
    async removeImage() {
        // Si hay imagen subida, eliminar de Supabase
        if (this.uploadedImageData && this.uploadedImageData.path) {
            try {
                const result = await window.supabaseCRUD.deleteImage(
                    this.uploadedImageData.path,
                    this.options.bucket
                );

                if (!result.success) {
                    console.error('Error al eliminar imagen:', result.error);
                }
            } catch (error) {
                console.error('Error al eliminar imagen:', error);
            }
        }

        // Callback de eliminación
        if (this.options.onRemove) {
            this.options.onRemove(this.uploadedImageData);
        }

        // Limpiar estado
        this.currentFile = null;
        this.uploadedImageData = null;

        // Ocultar preview
        const previewContainer = this.container.querySelector('.image-preview-container');
        previewContainer.classList.remove('active');

        // Limpiar input
        const uploadInput = this.container.querySelector('.upload-input');
        uploadInput.value = '';
    }

    /**
     * Obtener datos de la imagen subida
     */
    getUploadedImage() {
        return this.uploadedImageData;
    }

    /**
     * Establecer imagen existente (para edición)
     */
    setExistingImage(imageUrl, imageName = 'imagen-existente.jpg') {
        const previewContainer = this.container.querySelector('.image-preview-container');
        const previewImg = this.container.querySelector('.image-preview');
        const previewName = this.container.querySelector('.image-preview-name');
        const previewSize = this.container.querySelector('.image-preview-size');

        previewImg.src = imageUrl;
        previewName.textContent = imageName;
        previewSize.textContent = 'Imagen existente';

        previewContainer.classList.add('active');

        this.uploadedImageData = {
            url: imageUrl,
            existing: true
        };
    }

    /**
     * Mostrar progress bar
     */
    showProgress(percent) {
        const progressContainer = this.container.querySelector('.upload-progress');
        progressContainer.classList.add('active');
        this.updateProgress(percent);
    }

    /**
     * Actualizar progress bar
     */
    updateProgress(percent) {
        const progressFill = this.container.querySelector('.upload-progress-fill');
        const progressText = this.container.querySelector('.upload-progress-text');

        progressFill.style.width = percent + '%';
        progressText.textContent = `Subiendo... ${percent}%`;
    }

    /**
     * Ocultar progress bar
     */
    hideProgress() {
        const progressContainer = this.container.querySelector('.upload-progress');
        progressContainer.classList.remove('active');
    }

    /**
     * Formatear tamaño de archivo
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Mostrar mensaje de error
     */
    showError(message) {
        alert('Error: ' + message);
    }

    /**
     * Mostrar mensaje de éxito
     */
    showSuccess(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'upload-success-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i> ${message}
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Exportar para uso global
window.ImageUpload = ImageUpload;
