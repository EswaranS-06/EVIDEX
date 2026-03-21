import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getEvidence, uploadEvidence, deleteEvidence, reorderEvidence } from '../api/evidence';
import { Plus, Upload, File, Eye, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { useModal } from '../context/ModalContext';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const getFullImageUrl = (path) => {
    if (!path) return '';
    if (typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Sortable evidence item wrapper
const SortableEvidenceItem = ({ item, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '16px',
        position: 'relative',
        zIndex: isDragging ? 999 : 'auto'
    };

    return (
        <div ref={setNodeRef} style={style} className={`glass-panel ${isDragging ? 'dragging' : ''}`}>
            <div style={{ display: 'flex' }}>
                <div
                    {...attributes}
                    {...listeners}
                    style={{
                        padding: '20px 10px',
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-muted)',
                        borderRight: '1px solid var(--color-border)',
                        backgroundColor: 'rgba(0,0,0,0.1)'
                    }}
                >
                    <GripVertical size={20} />
                </div>

                <div style={{ padding: '20px', flex: 1, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <button className="btn btn-ghost" style={{ padding: '4px', marginRight: '8px', color: 'var(--color-text-main)' }}>
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{item.title}</h3>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="btn btn-ghost"
                            style={{ padding: '6px', color: 'var(--color-error)' }}
                            title="Delete Evidence"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {isExpanded && (
                        <div style={{ marginTop: '15px' }}>
                            {item.description && <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px', fontSize: '0.9rem' }}>{item.description}</p>}

                            {item.file && (typeof item.file === 'string' ? (
                                <div className="evidence-image-container">
                                    <img
                                        src={getFullImageUrl(item.file)}
                                        alt={item.title}
                                        className="evidence-image"
                                    />
                                    <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)', width: '100%' }}>
                                        <a href={getFullImageUrl(item.file)} target="_blank" rel="noopener noreferrer" className="evidence-link">
                                            <Eye size={14} /> View Original Image
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                    <File size={20} className="text-secondary" style={{ color: 'var(--color-primary)' }} />
                                    <span style={{ fontSize: '0.9rem' }}>{item.file.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const EvidenceSection = ({ findingId, isNew }) => {
    const { alert, confirm } = useModal();
    const [evidenceList, setEvidenceList] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newEvidence, setNewEvidence] = useState({ title: '', file: null, notes: '' });
    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const loadEvidence = useCallback(async () => {
        if (!findingId || isNew) return;
        try {
            const data = await getEvidence(findingId);
            setEvidenceList(data); // Assume data returns correctly ordered array
        } catch (error) {
            console.error('Failed to fetch evidence', error);
        }
    }, [findingId, isNew]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadEvidence();
    }, [findingId, isNew, loadEvidence]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewEvidence({ ...newEvidence, file: file });
        }
    };

    const handleAddEvidence = async () => {
        if (!newEvidence.title || !newEvidence.file) return;

        try {
            const formData = new FormData();
            formData.append('title', newEvidence.title);
            formData.append('file', newEvidence.file);
            formData.append('description', newEvidence.notes);

            await uploadEvidence(findingId, formData);
            await loadEvidence();

            setNewEvidence({ title: '', file: null, notes: '' });
            setShowUploadForm(false);
        } catch (error) {
            console.error("Upload failed", error);
            await alert("Failed to upload evidence", "Upload Error");
        }
    };

    const handleDeleteEvidence = async (id) => {
        const confirmed = await confirm("Are you sure you want to delete this evidence? This action cannot be undone.", "Delete Evidence");
        if (confirmed) {
            try {
                await deleteEvidence(id);
                setEvidenceList(current => current.filter(e => e.id !== id));
            } catch (err) {
                console.error("Failed to delete", err);
                await alert("Failed to delete evidence", "Delete Error");
            }
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = evidenceList.findIndex(e => e.id.toString() === active.id);
            const newIndex = evidenceList.findIndex(e => e.id.toString() === over.id);

            const newArray = arrayMove(evidenceList, oldIndex, newIndex);
            setEvidenceList(newArray);

            // Persist order to backend
            try {
                const orderedIds = newArray.map(item => item.id);
                await reorderEvidence(findingId, orderedIds);
            } catch (err) {
                console.error("Failed to save reorder", err);
            }
        }
    };

    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Evidence ({evidenceList.length})</h2>
                {!showUploadForm && !isNew && (
                    <button className="btn btn-primary" onClick={() => setShowUploadForm(true)}>
                        <Plus size={18} style={{ marginRight: '5px' }} /> Add Evidence
                    </button>
                )}
                {isNew && <span style={{ color: 'var(--color-text-muted)' }}>Save finding to add evidence</span>}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={evidenceList.map(e => e.id.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    {evidenceList.map((item) => (
                        <SortableEvidenceItem
                            key={item.id}
                            item={item}
                            onDelete={handleDeleteEvidence}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            {showUploadForm && (
                <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--color-primary)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Evidence Upload</h3>

                    <div className="input-group">
                        <label className="input-label">Title / Description</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Admin Login Page reflected XSS"
                            value={newEvidence.title}
                            onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">File</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                border: '2px dashed var(--color-border)',
                                padding: '20px',
                                textAlign: 'center',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: newEvidence.file ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                background: newEvidence.file ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
                                borderColor: newEvidence.file ? 'var(--color-primary)' : 'var(--color-border)'
                            }}
                        >
                            <Upload size={24} style={{ display: 'block', margin: '0 auto 10px' }} />
                            {newEvidence.file ? newEvidence.file.name : 'Choose File or Drag & Drop'}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Notes (Optional)</label>
                        <textarea
                            className="input-field"
                            rows="3"
                            value={newEvidence.notes}
                            onChange={(e) => setNewEvidence({ ...newEvidence, notes: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button className="btn btn-primary" onClick={handleAddEvidence} style={{ flex: 1 }}>
                            Upload
                        </button>
                        <button className="btn btn-ghost" onClick={() => setShowUploadForm(false)} style={{ flex: 1 }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvidenceSection;
