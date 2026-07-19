<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar>
      <template #navigation>
        <button
          @click="activeTab = 'materials'"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3',
            activeTab === 'materials'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:bg-gray-800',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          Materials
        </button>
        <button
          @click="
            activeTab = 'users';
            loadUsersData();
          "
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3',
            activeTab === 'users'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:bg-gray-800',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          Users
        </button>
        <button
          @click="
            activeTab = 'logs';
            loadAuditLogs();
          "
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3',
            activeTab === 'logs'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:bg-gray-800',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            ></path>
          </svg>
          Audit Logs
        </button>
        <button
          @click="
            activeTab = 'categories';
            loadCategoriesData();
          "
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3',
            activeTab === 'categories'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:bg-gray-800',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            ></path>
          </svg>
          Categories
        </button>
      </template>
    </Sidebar>

    <!-- Main Content -->
    <main class="pt-20 md:pt-16 md:ml-72 p-4 md:p-8 min-h-screen">
      <!-- ================= MATERIALS TAB ================= -->
      <div v-if="activeTab === 'materials'">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
            Materials Management
          </h1>
          <button
            @click="showUpload = !showUpload"
            class="btn btn-primary w-full sm:w-auto"
          >
            {{ showUpload ? "Hide Upload Form" : "+ Upload Material" }}
          </button>
        </div>

        <div
          v-if="showUpload"
          class="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100"
        >
          <h3 class="text-xl font-semibold mb-4">Upload New Material</h3>
          <form @submit.prevent="handleUpload" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input v-model="uploadForm.title" type="text" required class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Description</label
              >
              <textarea
                v-model="uploadForm.description"
                rows="3"
                class="form-input"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Department</label
              >
              <select
                v-model="uploadForm.department_id"
                @change="filterCoursesByDepartment"
                class="form-input"
              >
                <option value="" disabled>Choose Department</option>
                <option
                  v-for="dept in usersStore.departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                v-model="uploadForm.course_id"
                :disabled="!uploadForm.department_id"
                required
                class="form-input disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {{
                    uploadForm.department_id
                      ? "Select a Course"
                      : "Please select a department first"
                  }}
                </option>
                <option
                  v-for="course in filteredCourses"
                  :key="course.id"
                  :value="course.id"
                >
                  {{ course.code }} - {{ course.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select v-model="uploadForm.semester" required class="form-input">
                <option value="">Select Semester</option>
                <option value="1">First Semester (Harmattan)</option>
                <option value="2">Second Semester (Rain)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">File</label>
              <input type="file" @change="handleFileChange" required class="form-input" />
              <p class="text-xs text-gray-500 mt-1">
                Max file size: 50MB. Only the latest version will be kept.
              </p>
            </div>
            <p v-if="uploadError" class="text-red-600 text-sm">{{ uploadError }}</p>
            <button
              type="submit"
              :disabled="uploading"
              class="btn btn-primary w-full sm:w-auto"
            >
              {{ uploading ? "Uploading..." : "Upload" }}
            </button>
          </form>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 xl:gap-0">
          <div
            class="hidden xl:grid xl:grid-cols-12 gap-4 bg-gray-100 p-3 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            <div class="col-span-2">Title</div>
            <div class="col-span-2">Course</div>
            <div class="col-span-2">Department</div>
            <div class="col-span-2">Uploader</div>
            <div class="col-span-1">Status</div>
            <div class="col-span-1">Downloads</div>
            <div class="col-span-2">Actions</div>
          </div>

          <div
            v-for="material in materialsStore.materials"
            :key="material.id"
            class="bg-white p-5 rounded-lg shadow-sm border border-gray-100 xl:shadow-none xl:border-0 xl:bg-transparent xl:p-0 xl:rounded-none xl:grid xl:grid-cols-12 xl:gap-4 xl:items-center xl:border-b xl:py-3 hover:shadow-md xl:hover:bg-gray-50 transition"
          >
            <div class="xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Title</span
              >
              <p class="font-medium text-gray-900 break-words">{{ material.title }}</p>
            </div>
            <div class="mt-2 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Course</span
              >
              <p class="text-sm text-gray-600">{{ material.course_name }}</p>
            </div>
            <div class="mt-2 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Department</span
              >
              <p class="text-sm text-gray-600">{{ material.department_name || "N/A" }}</p>
            </div>
            <div class="mt-2 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Uploader</span
              >
              <p class="text-sm text-gray-600">{{ material.uploader_name }}</p>
            </div>
            <div class="mt-2 xl:mt-0 xl:col-span-1">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Status</span
              >
              <span :class="['status-badge', `status-${material.status}`]">{{
                material.status
              }}</span>
            </div>
            <div class="mt-2 xl:mt-0 xl:col-span-1">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Downloads</span
              >
              <p class="text-sm text-gray-600">{{ material.download_count }}</p>
            </div>
            <div class="mt-4 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden block mb-2"
                >Actions</span
              >
              <div v-if="material.status === 'pending'" class="flex gap-2">
                <button
                  @click="materialsStore.approveMaterial(material.id)"
                  class="btn btn-success text-sm flex-1"
                >
                  Approve
                </button>
                <button
                  @click="handleReject(material.id)"
                  class="btn btn-danger text-sm flex-1"
                >
                  Reject
                </button>
              </div>
              <button
                v-else-if="material.status === 'approved'"
                @click="handleDownload(material.id)"
                class="btn btn-primary text-sm w-full"
              >
                Download
              </button>
              <span v-else class="text-gray-400 text-sm italic">Rejected</span>
            </div>
          </div>
          <p
            v-if="materialsStore.loading"
            class="text-center text-gray-500 py-8 bg-white rounded-lg md:col-span-2 xl:col-span-1"
          >
            Loading materials...
          </p>
          <p
            v-else-if="materialsStore.materials.length === 0"
            class="text-center text-gray-500 py-8 bg-white rounded-lg md:col-span-2 xl:col-span-1"
          >
            No materials uploaded yet.
          </p>
        </div>
      </div>

      <!-- ================= USERS TAB ================= -->
      <div v-if="activeTab === 'users'">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
          <button
            @click="showUserForm = !showUserForm"
            class="btn btn-primary w-full sm:w-auto"
          >
            {{ showUserForm ? "Hide Form" : "+ Add User" }}
          </button>
        </div>

        <div
          v-if="showUserForm"
          class="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100"
        >
          <h3 class="text-xl font-semibold mb-4">Create New User</h3>
          <form @submit.prevent="handleCreateUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Full Name</label
              >
              <input
                v-model="userForm.full_name"
                type="text"
                required
                class="form-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="userForm.email" type="email" required class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                v-model="userForm.password"
                type="password"
                required
                minlength="6"
                class="form-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select v-model="userForm.role" required class="form-input">
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div v-if="userForm.role === 'student'">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Matric Number</label
              >
              <input
                v-model="userForm.matric_number"
                type="text"
                class="form-input"
                placeholder="e.g., CSC/2024/001"
              />
            </div>

            <div v-if="userForm.role !== 'student'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
              <input
                v-model="userForm.staff_id"
                type="text"
                class="form-input"
                placeholder="e.g., UNICROSS/STAFF/01"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Department</label
              >
              <select v-model="userForm.department_id" class="form-input">
                <option value="">Unassigned (System Admin)</option>
                <option
                  v-for="dept in usersStore.departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <p v-if="userError" class="text-red-600 text-sm">{{ userError }}</p>
            <button
              type="submit"
              :disabled="creatingUser"
              class="btn btn-primary w-full sm:w-auto"
            >
              {{ creatingUser ? "Creating..." : "Create User" }}
            </button>
          </form>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 xl:gap-0">
          <div
            class="hidden xl:grid xl:grid-cols-12 gap-4 bg-gray-100 p-3 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            <div class="col-span-2">Name</div>
            <div class="col-span-2">Email</div>
            <div class="col-span-2">Role</div>
            <div class="col-span-2">Department</div>
            <div class="col-span-2">Status</div>
            <div class="col-span-2">Actions</div>
          </div>

          <div
            v-for="user in usersStore.users"
            :key="user.id"
            class="bg-white p-5 rounded-lg shadow-sm border border-gray-100 xl:shadow-none xl:border-0 xl:bg-transparent xl:p-0 xl:rounded-none xl:grid xl:grid-cols-12 xl:gap-4 xl:items-center xl:border-b xl:py-3 hover:shadow-md xl:hover:bg-gray-50 transition"
          >
            <div class="xl:col-span-2 flex items-center gap-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              >
                {{
                  user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U"
                }}
              </div>
              <div class="min-w-0 flex-grow xl:block">
                <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                  >Name</span
                >
                <p class="font-medium text-gray-900 truncate">{{ user.full_name }}</p>
              </div>
            </div>

            <div class="mt-3 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Email</span
              >
              <p class="text-sm text-gray-600 break-all xl:break-normal">
                {{ user.email }}
              </p>
            </div>

            <div class="mt-3 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Role</span
              >
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize"
                >{{ user.role }}</span
              >
            </div>

            <div class="mt-3 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Department</span
              >
              <select
                :value="user.department_id"
                @change="updateUserDept(user.id, $event.target.value)"
                class="text-sm border-gray-300 rounded-md w-full p-1.5 bg-white shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Unassigned</option>
                <option
                  v-for="dept in usersStore.departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <!-- ✅ UPDATED: Strict comparison for is_active === 1 -->
            <div class="mt-3 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Status</span
              >
              <span
                :class="
                  user.is_active === 1
                    ? 'status-badge status-approved'
                    : 'status-badge status-rejected'
                "
              >
                {{ user.is_active === 1 ? "Active" : "Inactive" }}
              </span>
            </div>

            <div class="mt-4 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden block mb-2"
                >Actions</span
              >
              <!-- ✅ CRITICAL FIX: Explicitly sends 1 or 0 to the store -->
              <button
                @click="
                  usersStore.toggleUserStatus(user.id, user.is_active === 1 ? 0 : 1)
                "
                :class="[
                  'btn text-sm w-full',
                  user.is_active === 1 ? 'btn-danger' : 'btn-success',
                ]"
              >
                {{ user.is_active === 1 ? "Deactivate" : "Activate" }}
              </button>
            </div>
          </div>
          <p
            v-if="usersStore.loading"
            class="text-center text-gray-500 py-8 bg-white rounded-lg md:col-span-2 xl:col-span-1"
          >
            Loading users...
          </p>
          <p
            v-else-if="usersStore.users.length === 0"
            class="text-center text-gray-500 py-8 bg-white rounded-lg md:col-span-2 xl:col-span-1"
          >
            No users found.
          </p>
        </div>
      </div>

      <!-- ================= AUDIT LOGS TAB ================= -->
      <div v-if="activeTab === 'logs'">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">System Audit Logs</h1>
          <span
            class="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
            >Showing last 100 actions</span
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 xl:gap-0">
          <div
            class="hidden xl:grid xl:grid-cols-12 gap-4 bg-gray-100 p-3 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            <div class="col-span-3">User</div>
            <div class="col-span-2">Action</div>
            <div class="col-span-5">Details</div>
            <div class="col-span-2">Timestamp</div>
          </div>

          <div
            v-for="log in auditLogs"
            :key="log.id"
            class="bg-white p-5 rounded-lg shadow-sm border border-gray-100 xl:shadow-none xl:border-0 xl:bg-transparent xl:p-0 xl:rounded-none xl:grid xl:grid-cols-12 xl:gap-4 xl:items-center xl:border-b xl:py-3 hover:shadow-md xl:hover:bg-gray-50 transition"
          >
            <div class="xl:col-span-3">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >User</span
              >
              <p class="font-medium text-gray-900 text-sm">
                {{ log.user_name || "System" }}
              </p>
              <p class="text-xs text-gray-500 truncate">{{ log.email }}</p>
            </div>
            <div class="mt-2 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Action</span
              >
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ log.action }}
              </span>
            </div>
            <div class="mt-2 xl:mt-0 xl:col-span-5">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Details</span
              >
              <p class="text-sm text-gray-600 break-words">{{ log.details }}</p>
            </div>
            <div class="mt-2 xl:mt-0 xl:col-span-2">
              <span class="text-gray-500 text-xs font-bold uppercase xl:hidden"
                >Timestamp</span
              >
              <p class="text-xs text-gray-500">
                {{ new Date(log.created_at).toLocaleString() }}
              </p>
            </div>
          </div>
          <p
            v-if="loadingLogs"
            class="text-center text-gray-500 py-8 bg-white rounded-lg md:col-span-2 xl:col-span-1"
          >
            Loading logs...
          </p>
          <p
            v-else-if="auditLogs.length === 0"
            class="text-center text-gray-500 py-8 bg-white rounded-lg md:col-span-2 xl:col-span-1"
          >
            No audit logs found yet.
          </p>
        </div>
      </div>

      <!-- ================= CATEGORIES TAB ================= -->
      <div v-if="activeTab === 'categories'">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Manage Categories
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Departments Section -->
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Add New Department</h3>
            <form @submit.prevent="handleAddDepartment" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Department Name</label
                >
                <input
                  v-model="deptForm.name"
                  type="text"
                  required
                  class="form-input"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Department Code</label
                >
                <input
                  v-model="deptForm.code"
                  type="text"
                  required
                  class="form-input"
                  placeholder="e.g., CSC"
                />
              </div>
              <button
                type="submit"
                :disabled="usersStore.loading"
                class="btn btn-primary w-full disabled:opacity-50"
              >
                {{ usersStore.loading ? "Adding..." : "Add Department" }}
              </button>
            </form>

            <div class="mt-6">
              <h4 class="text-sm font-bold text-gray-500 uppercase mb-2">
                Existing Departments
              </h4>
              <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
                <div
                  v-for="dept in usersStore.departments"
                  :key="dept.id"
                  class="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm border border-gray-100"
                >
                  <div>
                    <span class="font-bold text-primary-600 mr-2">{{ dept.code }}</span>
                    <span class="text-gray-700">{{ dept.name }}</span>
                  </div>
                  <button
                    @click="handleDeleteDepartment(dept.id)"
                    class="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
                <p v-if="usersStore.loading" class="text-gray-500 text-sm italic">
                  Loading...
                </p>
                <p
                  v-else-if="usersStore.departments.length === 0"
                  class="text-gray-500 text-sm italic"
                >
                  No departments found.
                </p>
              </div>
            </div>
          </div>

          <!-- Courses Section -->
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Add New Course</h3>
            <form @submit.prevent="handleAddCourse" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Course Name</label
                >
                <input
                  v-model="courseForm.name"
                  type="text"
                  required
                  class="form-input"
                  placeholder="e.g., Intro to Programming"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Course Code</label
                >
                <input
                  v-model="courseForm.code"
                  type="text"
                  required
                  class="form-input"
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Department</label
                >
                <select v-model="courseForm.department_id" required class="form-input">
                  <option value="">Select Department</option>
                  <option
                    v-for="dept in usersStore.departments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <button
                type="submit"
                :disabled="usersStore.loading"
                class="btn btn-primary w-full disabled:opacity-50"
              >
                {{ usersStore.loading ? "Adding..." : "Add Course" }}
              </button>
            </form>

            <div class="mt-6">
              <h4 class="text-sm font-bold text-gray-500 uppercase mb-2">
                Existing Courses
              </h4>
              <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
                <div
                  v-for="course in usersStore.courses"
                  :key="course.id"
                  class="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm border border-gray-100"
                >
                  <div>
                    <span class="font-bold text-primary-600 mr-2">{{ course.code }}</span>
                    <span class="text-gray-700">{{ course.name }}</span>
                  </div>
                  <button
                    @click="handleDeleteCourse(course.id)"
                    class="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
                <p v-if="usersStore.loading" class="text-gray-500 text-sm italic">
                  Loading...
                </p>
                <p
                  v-else-if="usersStore.courses.length === 0"
                  class="text-gray-500 text-sm italic"
                >
                  No courses found.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useMaterialsStore } from "../stores/materials";
import { useUsersStore } from "../stores/users";
import { useRouter } from "vue-router";
import api from "../api/axios";
import Sidebar from "../components/Sidebar.vue";

const router = useRouter();
const authStore = useAuthStore();
const materialsStore = useMaterialsStore();
const usersStore = useUsersStore();

const activeTab = ref("materials");
const showUpload = ref(false);
const showUserForm = ref(false);
const uploading = ref(false);
const creatingUser = ref(false);
const uploadError = ref("");
const userError = ref("");
const loadingLogs = ref(false);

const uploadForm = ref({
  title: "",
  description: "",
  department_id: "",
  course_id: "",
  semester: "",
  file: null,
});

const userForm = ref({
  full_name: "",
  email: "",
  password: "",
  role: "student",
  matric_number: "",
  staff_id: "",
  department_id: "",
});

const auditLogs = ref([]);

const deptForm = ref({ name: "", code: "" });
const courseForm = ref({ name: "", code: "", department_id: "" });

// Computed property to filter courses by selected department
const filteredCourses = computed(() => {
  if (!uploadForm.value.department_id) {
    return [];
  }
  return usersStore.courses.filter(
    (c) => c.department_id == uploadForm.value.department_id
  );
});

// ==================== LOAD DATA FUNCTIONS ====================
async function loadAllData() {
  await Promise.all([
    materialsStore.fetchMaterials(),
    usersStore.fetchUsers(),
    usersStore.fetchDepartments(),
    usersStore.fetchCourses(),
  ]);
}

async function loadUsersData() {
  if (usersStore.users.length === 0) {
    await usersStore.fetchUsers();
  }
  if (usersStore.departments.length === 0) {
    await usersStore.fetchDepartments();
  }
}

async function loadAuditLogs() {
  if (auditLogs.value.length === 0) {
    loadingLogs.value = true;
    try {
      const response = await api.get("/admin/audit-logs");
      auditLogs.value = response.data.data || [];
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      loadingLogs.value = false;
    }
  }
}

async function loadCategoriesData() {
  if (usersStore.departments.length === 0) {
    await usersStore.fetchDepartments();
  }
  if (usersStore.courses.length === 0) {
    await usersStore.fetchCourses();
  }
}

// ==================== LIFECYCLE ====================
onMounted(async () => {
  await loadAllData();
});

// ==================== MATERIALS FUNCTIONS ====================
function handleFileChange(e) {
  uploadForm.value.file = e.target.files[0];
}

function filterCoursesByDepartment() {
  uploadForm.value.course_id = "";
}

async function handleUpload() {
  uploadError.value = "";
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", uploadForm.value.file);
    formData.append("title", uploadForm.value.title);
    formData.append("description", uploadForm.value.description);
    formData.append("course_id", uploadForm.value.course_id);
    formData.append("semester", uploadForm.value.semester);

    await materialsStore.uploadMaterial(formData);
    showUpload.value = false;
    uploadForm.value = {
      title: "",
      description: "",
      department_id: "",
      course_id: "",
      semester: "",
      file: null,
    };
  } catch (err) {
    uploadError.value = err.response?.data?.message || "Upload failed";
  } finally {
    uploading.value = false;
  }
}

async function handleReject(id) {
  const reason = prompt("Enter rejection reason:");
  if (reason) await materialsStore.rejectMaterial(id, reason);
}

async function handleDownload(id) {
  try {
    const material = materialsStore.materials.find((m) => m.id === id);
    if (!material) return;
    const response = await api.get(`/materials/${id}/download`, { responseType: "blob" });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", material.original_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    await materialsStore.fetchMaterials();
  } catch (err) {
    alert("Download failed: " + (err.response?.data?.message || "Unknown error"));
  }
}

// ==================== USERS FUNCTIONS ====================
async function handleCreateUser() {
  userError.value = "";
  creatingUser.value = true;
  try {
    await usersStore.createUser({
      full_name: userForm.value.full_name,
      email: userForm.value.email,
      password: userForm.value.password,
      role: userForm.value.role,
      matric_number: userForm.value.matric_number || null,
      staff_id: userForm.value.staff_id || null,
      department_id: userForm.value.department_id || null,
    });
    showUserForm.value = false;
    userForm.value = {
      full_name: "",
      email: "",
      password: "",
      role: "student",
      matric_number: "",
      staff_id: "",
      department_id: "",
    };
  } catch (err) {
    userError.value = err.response?.data?.message || "Failed to create user";
  } finally {
    creatingUser.value = false;
  }
}

async function updateUserDept(userId, deptId) {
  try {
    // 1. Update the backend
    await api.patch(`/admin/users/${userId}/department`, {
      department_id: deptId || null,
    });

    // 2. Manually update the local state
    const user = usersStore.users.find((u) => u.id === userId);
    if (user) {
      user.department_id = deptId || null;

      // Find the department name
      const dept = usersStore.departments.find((d) => d.id == deptId);
      user.department_name = dept ? dept.name : "Unassigned";

      // Update matriculation number format (for students)
      if (user.role === "student" && dept) {
        // Format: DEPTCODE/STUDENTID
        user.matric_number = `${dept.code}/${user.matric_number.split("/")[1] || "001"}`;
      }
    }

    // 3. Force reactivity
    usersStore.users = [...usersStore.users];

    // 4. Update the current user's profile if they're viewing it
    if (authStore.user?.id === userId) {
      authStore.user.department_id = deptId || null;
      authStore.user.department_name = dept ? dept.name : "Unassigned";
      authStore.user.matric_number = user.matric_number;
    }
  } catch (err) {
    console.error("Update dept error:", err);
    alert(
      "Failed to update department: " + (err.response?.data?.message || "Unknown error")
    );
  }
}

// ==================== CATEGORIES FUNCTIONS ====================
async function handleAddDepartment() {
  try {
    await usersStore.addDepartment(deptForm.value);
    deptForm.value = { name: "", code: "" };
  } catch (err) {
    alert(err.message || "Failed to add department");
  }
}

async function handleAddCourse() {
  try {
    await usersStore.addCourse(courseForm.value);
    courseForm.value = { name: "", code: "", department_id: "" };
  } catch (err) {
    alert(err.message || "Failed to add course");
  }
}

async function handleDeleteCourse(id) {
  if (confirm("Are you sure you want to delete this course?")) {
    try {
      await api.delete(`/admin/courses/${id}`);
      await usersStore.fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
    }
  }
}

async function handleDeleteDepartment(id) {
  if (confirm("Are you sure you want to delete this department?")) {
    try {
      await api.delete(`/admin/departments/${id}`);
      await usersStore.fetchDepartments();
      await usersStore.fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete department");
    }
  }
}
</script>
