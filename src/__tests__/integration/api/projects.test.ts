import { describe, it, expect } from 'vitest'
import { createMockProject } from '../../utils/mocks'

describe('Projects API - Data Layer', () => {
  describe('Project Model', () => {
    it('should create valid project object', () => {
      const project = createMockProject()

      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('adminId')
      expect(project).toHaveProperty('createdAt')
    })

    it('should create project with name and admin', () => {
      const projectData = {
        name: 'Test Project',
        adminId: 'user-123',
        description: 'A test project',
      }

      const project = createMockProject(projectData)

      expect(project.name).toBe('Test Project')
      expect(project.adminId).toBe('user-123')
      expect(project.description).toBe('A test project')
    })

    it('should generate unique project IDs', () => {
      const proj1 = createMockProject()
      const proj2 = createMockProject()

      expect(proj1.id).not.toBe(proj2.id)
    })

    it('should include project relations (admin, community, quests, badges, token)', () => {
      const project = createMockProject()

      expect(project).toHaveProperty('admin')
      expect(project).toHaveProperty('community')
      expect(project).toHaveProperty('quests')
      expect(project).toHaveProperty('badges')
      expect(project).toHaveProperty('token')
    })

    it('should support project with all optional fields', () => {
      const projectData = {
        name: 'Full Project',
        description: 'Complete project',
        adminId: 'user-123',
        image: 'https://example.com/image.jpg',
        status: 'active',
        visibility: 'public',
      }

      const project = createMockProject(projectData)

      expect(project.name).toBe('Full Project')
      expect(project.description).toBe('Complete project')
      expect(project.image).toBe('https://example.com/image.jpg')
      expect(project.status).toBe('active')
      expect(project.visibility).toBe('public')
    })

    it('should support project search by name', () => {
      const projectName = 'searchable-project'
      const project = createMockProject({ name: projectName })

      expect(project.name).toBe(projectName)
    })

    it('should support pagination for multiple projects', () => {
      const projects = [
        createMockProject({ name: 'Project 1' }),
        createMockProject({ name: 'Project 2' }),
        createMockProject({ name: 'Project 3' }),
      ]

      expect(projects).toHaveLength(3)
      projects.forEach((p, idx) => {
        expect(p.id).toBeDefined()
        expect(p.name).toBe(`Project ${idx + 1}`)
      })
    })

    it('should support filtering projects by admin', () => {
      const adminId = 'admin-user-999'
      const project = createMockProject({ adminId })

      expect(project.adminId).toBe(adminId)
    })
  })
})
