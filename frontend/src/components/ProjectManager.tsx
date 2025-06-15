import React, { useState } from 'react';
import { Project, ProjectCreate, ProjectUpdate } from '../types/todo';

interface ProjectManagerProps {
  projects: Project[];
  selectedProjectId: number | null;
  onProjectSelect: (projectId: number | null) => void;
  onProjectCreate: (project: ProjectCreate) => Promise<void>;
  onProjectUpdate: (id: number, project: ProjectUpdate) => Promise<void>;
  onProjectDelete: (id: number) => Promise<void>;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  selectedProjectId,
  onProjectSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [createForm, setCreateForm] = useState<ProjectCreate>({
    name: '',
    description: '',
    color: '#667eea',
  });

  const predefinedColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
    '#ff9a9e', '#fecfef', '#ffeaa7', '#fab1a0'
  ];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      await onProjectCreate(createForm);
      setCreateForm({ name: '', description: '', color: '#667eea' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('プロジェクト作成エラー:', error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      await onProjectUpdate(editingProject.id, {
        name: editingProject.name,
        description: editingProject.description,
        color: editingProject.color,
      });
      setEditingProject(null);
    } catch (error) {
      console.error('プロジェクト更新エラー:', error);
    }
  };

  const handleDelete = async (project: Project) => {
    if (window.confirm(`プロジェクト「${project.name}」を削除しますか？\nこのプロジェクトに含まれるすべてのタスクも削除されます。`)) {
      try {
        await onProjectDelete(project.id);
      } catch (error) {
        console.error('プロジェクト削除エラー:', error);
      }
    }
  };

  return (
    <div className="project-manager">
      <div className="project-header">
        <h3>プロジェクト</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="add-project-btn"
        >
          追加
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateSubmit} className="project-form">
          <div className="form-group">
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="プロジェクト名"
              className="project-input"
              required
            />
          </div>
          <div className="form-group">
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="説明（オプション）"
              className="project-textarea"
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>カラー:</label>
            <div className="color-picker">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${createForm.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCreateForm({ ...createForm, color })}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">作成</button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="cancel-btn"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      <div className="project-list">
        <div className="project-item-container">
          <div className="project-item-wrapper">
            <button
              className={`project-item ${selectedProjectId === null ? 'active' : ''}`}
              onClick={() => onProjectSelect(null)}
              style={{ borderLeft: '4px solid #6c757d' }}
            >
              <span className="project-name">すべてのプロジェクト</span>
            </button>
          </div>
        </div>

        {projects.map(project => (
          <div key={project.id} className="project-item-container">
            {editingProject?.id === project.id ? (
              <form onSubmit={handleEditSubmit} className="project-edit-form">
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="project-input"
                  required
                />
                <textarea
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="project-textarea"
                  rows={2}
                />
                <div className="color-picker">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${editingProject.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingProject({ ...editingProject, color })}
                    />
                  ))}
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">保存</button>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="cancel-btn"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            ) : (
              <div className="project-item-wrapper">
                <button
                  className={`project-item ${selectedProjectId === project.id ? 'active' : ''}`}
                  onClick={() => onProjectSelect(project.id)}
                  style={{ borderLeft: `4px solid ${project.color}` }}
                >
                  <span className="project-name">{project.name}</span>
                </button>
                <div className="project-actions">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="edit-project-btn"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="delete-project-btn"
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManager; 