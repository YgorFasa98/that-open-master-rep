import {IProject, Project} from './Project'

export class ProjectsManager {
    list: Project[] = []
    ui: HTMLDivElement
    defaultProject: IProject = { //default Project data
        type: 'project',
        color: 'brown',
        acronym: 'SFH',
        name: 'Single Family House',
        address: 'None',
        status: 'Not started',
        cost: 0,
        progress: 100,
        companyName: 'University of Padua',
        projectType: 'Master degree thesis'
    }

    constructor(container:HTMLDivElement){
        this.ui = container
        this.newProject(this.defaultProject)
        this.setUI_projectsCount()
    }

    newProject(data: IProject){
        const project = new Project(data)
        const projectsNameList = this.list.map((project) => {return project.name})
        const nameInUse = projectsNameList.includes(data.name)
        const projectsAcronymList = this.list.map((project) => {return project.acronym})
        const acronymInUse = projectsAcronymList.includes(data.acronym)
        
        if (nameInUse && acronymInUse){
            throw new Error(`
            A project with the name "${data.name}" already exists.
            A project with the acronym "${data.acronym}" already exists.`)
        }
        if (nameInUse){
            throw new Error(`A project with the name "${data.name}" already exists.`)
        }
        if (acronymInUse){
            throw new Error(`A project with the acronym "${data.acronym}" already exists.`)
        }

        project.ui.addEventListener('click', () => {
            this.setProjectDetails(project)
        })

        this.ui.append(project.ui)
        this.list.push(project)

        this.setUI_projectsCount()
        return project
    }

    setProjectDetails (project:Project) {
        const pageProjects = document.getElementById('project-main-page') as HTMLElement //projects page
        const pageSingleProject = document.getElementById('single-project-page') as HTMLElement //single project page
        pageProjects.style.display = "none"
        pageSingleProject.style.display = ""

        const title_name = pageSingleProject.querySelector("[data-project-details-info='title-name']") as HTMLElement
        const title_address = pageSingleProject.querySelector("[data-project-details-info='title-address']") as HTMLElement
        const name = pageSingleProject.querySelector("[data-project-details-info='name']") as HTMLElement
        const address = pageSingleProject.querySelector("[data-project-details-info='address']") as HTMLElement
        const acronym = pageSingleProject.querySelector("[data-project-details-info='acronym']") as HTMLElement
        const company = pageSingleProject.querySelector("[data-project-details-info='company']") as HTMLElement
        const projectType = pageSingleProject.querySelector("[data-project-details-info='project-type']") as HTMLElement
        const status = pageSingleProject.querySelector("[data-project-details-info='status']") as HTMLElement
        const cost = pageSingleProject.querySelector("[data-project-details-info='cost']") as HTMLElement
        const progress = pageSingleProject.querySelector("[data-project-details-info='progress']") as HTMLElement
        
        if (title_name && title_address && name && address && acronym && company && projectType && status && cost && progress){
        title_name.textContent = name.textContent = project.name
        title_address.textContent = address.textContent = project.address
        acronym.textContent = project.acronym
        company.textContent = project.companyName
        projectType.textContent = project.projectType
        status.textContent = project.status
        cost.textContent = `${project.cost as unknown as string} €`
        progress.textContent = `${project.progress as unknown as string}%`
        progress.style.width = `${project.progress as unknown as string}%`
        }
    }

    setUI_projectsCount(){
        const ui_projectsCount = document.getElementById('ProjectsTitle') as HTMLElement
        ui_projectsCount.innerHTML = `
        Projects (${this.list.length})`
    }

    //da modificare
    getProject (id:string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
    }

    getProjectByName (name:string) {
        const project = this.list.find((project) => {
            project.name === name
        }) 
        return project
    }
    
    deleteProject (id: string) {
        const project = this.getProject(id)
        if (!project) {return}
        project.ui.remove()
        const remaining = this.list.filter((project) => {
            return project.id !== id
        })
        this.list = remaining
    }

    setUI_error(err:Error,disp:string,category:string='none'){
        const ui_errorNewProject = document.getElementById('new-project-error-tab') as HTMLElement
        ui_errorNewProject.style.display = disp
        ui_errorNewProject.innerHTML = `
        <h2>WARNING !</h2>
        <h3 style="font-weight: normal; margin-top: 10px">${err}</h3>`
    }

    importFromJSON (){
        const input = document.createElement('input') //create an html element tag <input>
        input.type = 'file' //in this way opens a window to select files from PC
        input.accept = 'application/json' //accept only json files

        const reader = new FileReader()

        input.click()

        input.addEventListener('change', () => {
            const fileList = input.files
            if (!fileList) {return}
            reader.readAsText(fileList[0])
        })

        reader.addEventListener("load", () => {
            const json = reader.result
            if (!json) {return}
            const projects: IProject[] = JSON.parse(json as string)
            const usedNames = new Array()
            for (const project of projects)
                if (project.type == 'project') {
                    try {
                        this.newProject(project)
                    } catch (error) {
                        usedNames.push(project.name)
                    }
                }
            if (usedNames.length == 0) {
                const d = document.getElementById('error-import-project') as HTMLDialogElement
                d.innerHTML = `
                    <h2 style="border-bottom: 2px solid black; padding: 20px;">WARNING !</h2>
                    <div style="white-space:pre-line; padding: 20px;">You are not importing a projects file.</div>
                    <h5 style="text-align: center; padding: 10px; border-top: 2px solid black;">Press ESC to exit</h5>`
                d.showModal()
            }else{
                //alert(`These names are already in use:\n${usedNames.join('\n')}.\nThese projects will not be imported`)
                const d = document.getElementById('error-import-project') as HTMLDialogElement
                d.innerHTML = `
                    <h2 style="border-bottom: 2px solid black; padding: 20px;">WARNING !</h2>
                    <div style="white-space:pre-line; padding: 20px;">These names are already in use:\n
                    - ${usedNames.join('\n- ')}
                    \nThese projects will not be imported.
                    </div>
                    <h5 style="text-align: center; padding: 10px; border-top: 2px solid black;">Press ESC to exit</h5>`
                d.showModal()
            }
        })
    }
}