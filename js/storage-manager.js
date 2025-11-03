// =====================================================
// GESTIÓN DE ALMACENAMIENTO DE ARCHIVOS - SUPABASE STORAGE
// =====================================================

/**
 * Configuración de buckets y restricciones
 */
const STORAGE_CONFIG = {
    buckets: {
        courseImages: 'course-images',
        certificates: 'certificates',
        courseMaterials: 'course-materials',
        avatars: 'avatars'
    },
    maxSizes: {
        courseImages: 5 * 1024 * 1024, // 5MB
        certificates: 10 * 1024 * 1024, // 10MB
        courseMaterials: 20 * 1024 * 1024, // 20MB
        avatars: 2 * 1024 * 1024 // 2MB
    },
    allowedTypes: {
        courseImages: ['image/jpeg', 'image/png', 'image/webp'],
        certificates: ['application/pdf'],
        courseMaterials: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        avatars: ['image/jpeg', 'image/png']
    }
};

/**
 * Clase principal para gestionar el almacenamiento de archivos
 */
class StorageManager {
    constructor() {
        this.supabase = window.supabaseClient;
        if (!this.supabase) {
            throw new Error('Supabase client no está inicializado');
        }
    }

    /**
     * Valida un archivo antes de subirlo
     */
    validateFile(file, bucketType) {
        const maxSize = STORAGE_CONFIG.maxSizes[bucketType];
        const allowedTypes = STORAGE_CONFIG.allowedTypes[bucketType];

        // Validar tamaño
        if (file.size > maxSize) {
            throw new Error(`El archivo es demasiado grande. Máximo permitido: ${this.formatFileSize(maxSize)}`);
        }

        // Validar tipo
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Tipo de archivo no permitido. Tipos aceptados: ${this.getReadableTypes(allowedTypes)}`);
        }

        return true;
    }

    /**
     * Genera un nombre único para el archivo
     */
    generateFileName(originalName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = originalName.split('.').pop();
        const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');
        return `${nameWithoutExtension}-${timestamp}-${randomString}.${extension}`;
    }

    /**
     * Sube una imagen de curso
     */
    async uploadCourseImage(file, courseId) {
        try {
            this.validateFile(file, 'courseImages');

            const fileName = this.generateFileName(file.name);
            const filePath = `courses/${courseId}/${fileName}`;

            const { data, error } = await this.supabase.storage
                .from(STORAGE_CONFIG.buckets.courseImages)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Obtener URL pública
            const { data: publicUrlData } = this.supabase.storage
                .from(STORAGE_CONFIG.buckets.courseImages)
                .getPublicUrl(filePath);

            return {
                success: true,
                filePath: data.path,
                publicUrl: publicUrlData.publicUrl,
                fileName: fileName
            };
        } catch (error) {
            console.error('Error al subir imagen de curso:', error);
            throw error;
        }
    }

    /**
     * Sube un certificado
     */
    async uploadCertificate(file, studentId, courseId) {
        try {
            this.validateFile(file, 'certificates');

            const fileName = this.generateFileName(file.name);
            const filePath = `students/${studentId}/certificates/${courseId}/${fileName}`;

            const { data, error } = await this.supabase.storage
                .from(STORAGE_CONFIG.buckets.certificates)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            return {
                success: true,
                filePath: data.path,
                fileName: fileName
            };
        } catch (error) {
            console.error('Error al subir certificado:', error);
            throw error;
        }
    }

    /**
     * Sube material de curso
     */
    async uploadCourseMaterial(file, courseId) {
        try {
            this.validateFile(file, 'courseMaterials');

            const fileName = this.generateFileName(file.name);
            const filePath = `courses/${courseId}/materials/${fileName}`;

            const { data, error } = await this.supabase.storage
                .from(STORAGE_CONFIG.buckets.courseMaterials)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            return {
                success: true,
                filePath: data.path,
                fileName: fileName
            };
        } catch (error) {
            console.error('Error al subir material de curso:', error);
            throw error;
        }
    }

    /**
     * Sube un avatar de usuario
     */
    async uploadAvatar(file, userId) {
        try {
            this.validateFile(file, 'avatars');

            const fileName = this.generateFileName(file.name);
            const filePath = `users/${userId}/${fileName}`;

            // Primero, eliminar avatar anterior si existe
            await this.deleteUserAvatars(userId);

            const { data, error } = await this.supabase.storage
                .from(STORAGE_CONFIG.buckets.avatars)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Obtener URL pública
            const { data: publicUrlData } = this.supabase.storage
                .from(STORAGE_CONFIG.buckets.avatars)
                .getPublicUrl(filePath);

            return {
                success: true,
                filePath: data.path,
                publicUrl: publicUrlData.publicUrl,
                fileName: fileName
            };
        } catch (error) {
            console.error('Error al subir avatar:', error);
            throw error;
        }
    }

    /**
     * Elimina un archivo
     */
    async deleteFile(bucketName, filePath) {
        try {
            const { error } = await this.supabase.storage
                .from(bucketName)
                .remove([filePath]);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            throw error;
        }
    }

    /**
     * Elimina todos los avatares de un usuario
     */
    async deleteUserAvatars(userId) {
        try {
            const { data: files } = await this.supabase.storage
                .from(STORAGE_CONFIG.buckets.avatars)
                .list(`users/${userId}`);

            if (files && files.length > 0) {
                const filesToRemove = files.map(file => `users/${userId}/${file.name}`);
                await this.supabase.storage
                    .from(STORAGE_CONFIG.buckets.avatars)
                    .remove(filesToRemove);
            }
        } catch (error) {
            console.error('Error al eliminar avatares anteriores:', error);
        }
    }

    /**
     * Obtiene la URL de descarga de un archivo privado
     */
    async getDownloadUrl(bucketName, filePath, expiresIn = 3600) {
        try {
            const { data, error } = await this.supabase.storage
                .from(bucketName)
                .createSignedUrl(filePath, expiresIn);

            if (error) throw error;

            return data.signedUrl;
        } catch (error) {
            console.error('Error al obtener URL de descarga:', error);
            throw error;
        }
    }

    /**
     * Lista archivos en un directorio
     */
    async listFiles(bucketName, path = '') {
        try {
            const { data, error } = await this.supabase.storage
                .from(bucketName)
                .list(path, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error al listar archivos:', error);
            throw error;
        }
    }

    /**
     * Formatea el tamaño de archivo a una cadena legible
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Convierte tipos MIME a nombres legibles
     */
    getReadableTypes(mimeTypes) {
        const typeMap = {
            'image/jpeg': 'JPG',
            'image/png': 'PNG',
            'image/webp': 'WEBP',
            'application/pdf': 'PDF',
            'application/msword': 'DOC',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
            'application/vnd.ms-powerpoint': 'PPT',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX'
        };

        return mimeTypes.map(type => typeMap[type] || type).join(', ');
    }
}

/**
 * Componente de UI para subir archivos con drag & drop
 */
class FileUploadWidget {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            bucketType: options.bucketType || 'courseImages',
            onUploadSuccess: options.onUploadSuccess || (() => {}),
            onUploadError: options.onUploadError || (() => {}),
            multiple: options.multiple || false,
            ...options
        };

        this.storageManager = new StorageManager();
        this.init();
    }

    init() {
        this.render();
        this.attachEvents();
    }

    render() {
        const maxSize = STORAGE_CONFIG.maxSizes[this.options.bucketType];
        const allowedTypes = STORAGE_CONFIG.allowedTypes[this.options.bucketType];

        this.container.innerHTML = `
            <div class="file-upload-widget">
                <div class="drop-zone" id="${this.container.id}-drop-zone">
                    <div class="drop-zone-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p class="drop-zone-text">
                        Arrastra y suelta archivos aquí o
                        <label for="${this.container.id}-file-input" class="file-input-label">
                            haz clic para seleccionar
                        </label>
                    </p>
                    <p class="drop-zone-hint">
                        Tipos permitidos: ${this.storageManager.getReadableTypes(allowedTypes)}<br>
                        Tamaño máximo: ${this.storageManager.formatFileSize(maxSize)}
                    </p>
                    <input
                        type="file"
                        id="${this.container.id}-file-input"
                        class="file-input-hidden"
                        accept="${allowedTypes.join(',')}"
                        ${this.options.multiple ? 'multiple' : ''}
                    >
                </div>
                <div class="upload-progress" id="${this.container.id}-progress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p class="progress-text">Subiendo archivo...</p>
                </div>
                <div class="upload-preview" id="${this.container.id}-preview"></div>
            </div>
        `;

        this.addStyles();
    }

    attachEvents() {
        const dropZone = document.getElementById(`${this.container.id}-drop-zone`);
        const fileInput = document.getElementById(`${this.container.id}-file-input`);

        // Drag & drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drop-zone-active');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drop-zone-active');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    async handleFiles(files) {
        const filesArray = Array.from(files);

        for (const file of filesArray) {
            await this.uploadFile(file);
        }
    }

    async uploadFile(file) {
        const progressEl = document.getElementById(`${this.container.id}-progress`);
        const previewEl = document.getElementById(`${this.container.id}-preview`);

        try {
            progressEl.style.display = 'block';

            let result;
            switch (this.options.bucketType) {
                case 'courseImages':
                    result = await this.storageManager.uploadCourseImage(file, this.options.courseId);
                    break;
                case 'certificates':
                    result = await this.storageManager.uploadCertificate(file, this.options.studentId, this.options.courseId);
                    break;
                case 'courseMaterials':
                    result = await this.storageManager.uploadCourseMaterial(file, this.options.courseId);
                    break;
                case 'avatars':
                    result = await this.storageManager.uploadAvatar(file, this.options.userId);
                    break;
            }

            progressEl.style.display = 'none';
            this.showPreview(file, result);
            this.options.onUploadSuccess(result);

        } catch (error) {
            progressEl.style.display = 'none';
            this.showError(error.message);
            this.options.onUploadError(error);
        }
    }

    showPreview(file, result) {
        const previewEl = document.getElementById(`${this.container.id}-preview`);
        const isImage = file.type.startsWith('image/');

        const previewHTML = `
            <div class="file-preview-item">
                ${isImage ? `<img src="${result.publicUrl}" alt="${file.name}" class="preview-image">` : ''}
                <div class="preview-info">
                    <p class="preview-name">${file.name}</p>
                    <p class="preview-size">${this.storageManager.formatFileSize(file.size)}</p>
                    <p class="preview-status success">
                        <i class="fas fa-check-circle"></i> Subido correctamente
                    </p>
                </div>
            </div>
        `;

        previewEl.innerHTML = previewHTML;
    }

    showError(message) {
        const previewEl = document.getElementById(`${this.container.id}-preview`);
        previewEl.innerHTML = `
            <div class="upload-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    addStyles() {
        if (document.getElementById('file-upload-widget-styles')) return;

        const style = document.createElement('style');
        style.id = 'file-upload-widget-styles';
        style.textContent = `
            .file-upload-widget {
                width: 100%;
                max-width: 600px;
            }

            .drop-zone {
                border: 2px dashed #9B11C0;
                border-radius: 8px;
                padding: 40px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                background-color: #f9f9f9;
            }

            .drop-zone:hover,
            .drop-zone-active {
                background-color: #f0e6f4;
                border-color: #7a0d9a;
            }

            .drop-zone-icon {
                font-size: 48px;
                color: #9B11C0;
                margin-bottom: 16px;
            }

            .drop-zone-text {
                font-size: 16px;
                color: #333;
                margin-bottom: 8px;
            }

            .file-input-label {
                color: #9B11C0;
                text-decoration: underline;
                cursor: pointer;
            }

            .drop-zone-hint {
                font-size: 14px;
                color: #666;
                margin-top: 8px;
            }

            .file-input-hidden {
                display: none;
            }

            .upload-progress {
                margin-top: 20px;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background-color: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background-color: #9B11C0;
                animation: progress 1.5s ease-in-out infinite;
            }

            @keyframes progress {
                0% { width: 0%; }
                50% { width: 100%; }
                100% { width: 0%; }
            }

            .progress-text {
                text-align: center;
                margin-top: 8px;
                color: #666;
            }

            .upload-preview {
                margin-top: 20px;
            }

            .file-preview-item {
                display: flex;
                align-items: center;
                padding: 12px;
                background-color: #f9f9f9;
                border-radius: 8px;
                gap: 16px;
            }

            .preview-image {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 4px;
            }

            .preview-info {
                flex: 1;
            }

            .preview-name {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .preview-size {
                font-size: 14px;
                color: #666;
                margin-bottom: 4px;
            }

            .preview-status.success {
                color: #28a745;
                font-size: 14px;
            }

            .upload-error {
                padding: 16px;
                background-color: #fee;
                border: 1px solid #fcc;
                border-radius: 8px;
                color: #c33;
                text-align: center;
            }

            .upload-error i {
                margin-right: 8px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Exportar para uso global
window.StorageManager = StorageManager;
window.FileUploadWidget = FileUploadWidget;
window.STORAGE_CONFIG = STORAGE_CONFIG;
