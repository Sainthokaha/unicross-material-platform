<template>
  <div class="min-h-screen bg-gray-50">
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
            {{ showUpload ? "Hide Form" : "+ Upload Material" }}
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
                @change="uploadForm.course_id = ''"
                class="form-input"
                required
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
                class="form-input disabled:bg-gray-100"
              >
                <option value="">
                  {{
                    uploadForm.department_id
                      ? "Select a Course"
                      : "Select a department first"
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

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div v-if="materialsStore.loading" class="p-8 text-center text-gray-500">
            Loading materials...
          </div>
          <div
            v-else-if="materialsStore.materials.length === 0"
            class="p-8 text-center text-gray-500"
          >
            No materials found.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Title</th>
                  <th class="px-6 py-3">Course</th>
                  <th class="px-6 py-3">Uploader</th>
                  <th class="px-6 py-3">Status</th>
                  <th class="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="m in materialsStore.materials"
                  :key="m.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 font-medium text-gray-900">{{ m.title }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ m.course_name }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ m.uploader_name }}</td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-bold',
                        m.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : m.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{ m.status.toUpperCase() }}
                    </span>
                  </td>

                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-2 pl-2 border-l border-gray-200">
                        <button
                          v-if="m.status !== 'approved'"
                          @click="materialsStore.approveMaterial(m.id)"
                          class="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white hover:shadow-md transition-all duration-200"
                          title="Approve Material"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2.5"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </button>
                        <button
                          v-if="m.status !== 'rejected'"
                          @click="handleReject(m.id)"
                          class="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-md transition-all duration-200"
                          title="Reject Material"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2.5"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p
                      v-if="m.status === 'rejected' && m.rejection_reason"
                      class="text-xs text-red-500 mt-2 italic flex items-center gap-1"
                      :title="m.rejection_reason"
                    >
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      {{ m.rejection_reason }}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <input
                  v-model="userForm.email"
                  type="email"
                  required
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Password</label
                >
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
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="userForm.role === 'student'">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Matric Number</label
                >
                <input
                  v-model="userForm.matric_number"
                  type="text"
                  class="form-input"
                  placeholder="e.g., 24/CSC/001"
                />
              </div>
              <div v-if="userForm.role !== 'student'">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Staff ID</label
                >
                <input
                  v-model="userForm.staff_id"
                  type="text"
                  class="form-input"
                  placeholder="e.g., STF/001"
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
            </div>

            <p v-if="userError" class="text-red-600 text-sm">{{ userError }}</p>
            <button
              type="submit"
              :disabled="usersStore.loading"
              class="btn btn-primary w-full sm:w-auto"
            >
              {{ usersStore.loading ? "Creating..." : "Create User" }}
            </button>
          </form>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div v-if="usersStore.loading" class="p-8 text-center text-gray-500">
            Loading users...
          </div>
          <div
            v-else-if="usersStore.users.length === 0"
            class="p-8 text-center text-gray-500"
          >
            No users found.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Name</th>
                  <th class="px-6 py-3">Email</th>
                  <th class="px-6 py-3">Role</th>
                  <th class="px-6 py-3">Department</th>
                  <th class="px-6 py-3">Matric/Staff ID</th>
                  <th class="px-6 py-3">Status</th>
                  <th class="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="user in usersStore.users"
                  :key="user.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 font-medium text-gray-900">
                    {{ user.full_name }}
                  </td>
                  <td class="px-6 py-4 text-gray-600">{{ user.email }}</td>

                  <td class="px-6 py-4">
                    <select
                      :value="user.role"
                      @change="handleRoleChange(user.id, $event.target.value)"
                      class="text-sm border-gray-300 rounded-md p-1.5 bg-white shadow-sm focus:ring-primary-500 focus:border-primary-500 capitalize"
                    >
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td class="px-6 py-4">
                    <select
                      :value="user.department_id || ''"
                      @change="handleDeptChange(user.id, $event.target.value)"
                      class="text-sm border-gray-300 rounded-md p-1.5 bg-white shadow-sm focus:ring-primary-500 focus:border-primary-500"
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
                  </td>
                  <td class="px-6 py-4 text-gray-600">
                    {{
                      user.role === "student"
                        ? user.matric_number || "N/A"
                        : user.staff_id || "N/A"
                    }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-bold',
                        user.is_active === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                      ]"
                    >
                      {{ user.is_active === 1 ? "Active" : "Inactive" }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      @click="
                        usersStore.toggleUserStatus(user.id, user.is_active === 1 ? 0 : 1)
                      "
                      :class="[
                        'text-xs font-bold px-3 py-1 rounded',
                        user.is_active === 1
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50',
                      ]"
                    >
                      {{ user.is_active === 1 ? "Deactivate" : "Activate" }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div v-if="usersStore.loading" class="p-8 text-center text-gray-500">
            Loading logs...
          </div>
          <div
            v-else-if="usersStore.auditLogs.length === 0"
            class="p-8 text-center text-gray-500"
          >
            No audit logs found.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">User</th>
                  <th class="px-6 py-3">Action</th>
                  <th class="px-6 py-3">Details</th>
                  <th class="px-6 py-3">Device / IP</th>
                  <th class="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="log in usersStore.auditLogs"
                  :key="log.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4">
                    <p class="font-medium text-gray-900 text-sm">
                      {{ log.full_name || "System" }}
                    </p>
                    <p class="text-xs text-gray-500 truncate max-w-[150px]">
                      {{ log.email }}
                    </p>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ log.action.replace("_", " ") }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-600 break-words max-w-xs">
                    {{ log.details }}
                  </td>

                  <td class="px-6 py-4">
                    <p
                      class="text-xs text-gray-900 font-medium flex items-center gap-1"
                      :title="log.user_agent || 'Unknown Device'"
                    >
                      <span v-if="log.user_agent && log.user_agent.includes('Mobile')"
                        >📱 Mobile</span
                      >
                      <span v-else-if="log.user_agent">💻 Desktop</span>
                      <span v-else>❓ Unknown</span>
                    </p>
                    <p class="text-xs text-gray-500 font-mono mt-1">
                      {{ log.ip_address || "Unknown IP" }}
                    </p>
                  </td>

                  <td class="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {{ new Date(log.created_at).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= CATEGORIES TAB ================= -->
      <div v-if="activeTab === 'categories'">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Manage Categories
        </h1>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Add Department</h3>
            <form @submit.prevent="handleAddDepartment" class="space-y-4">
              <input
                v-model="deptForm.name"
                type="text"
                placeholder="Department Name (e.g., Computer Science)"
                required
                class="form-input"
              />
              <input
                v-model="deptForm.code"
                type="text"
                placeholder="Code (e.g., CSC)"
                required
                class="form-input"
              />
              <button
                type="submit"
                :disabled="usersStore.loading"
                class="btn btn-primary w-full"
              >
                {{ usersStore.loading ? "Adding..." : "Add Department" }}
              </button>
            </form>
            <div class="mt-6 space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="dept in usersStore.departments"
                :key="dept.id"
                class="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm"
              >
                <span
                  ><span class="font-bold text-primary-600 mr-2">{{ dept.code }}</span>
                  {{ dept.name }}</span
                >
                <button
                  @click="handleDeleteDepartment(dept.id)"
                  class="text-red-500 hover:text-red-700 text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Add Course</h3>
            <form @submit.prevent="handleAddCourse" class="space-y-4">
              <input
                v-model="courseForm.name"
                type="text"
                placeholder="Course Name"
                required
                class="form-input"
              />
              <input
                v-model="courseForm.code"
                type="text"
                placeholder="Course Code (e.g., CSC101)"
                required
                class="form-input"
              />
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
              <button
                type="submit"
                :disabled="usersStore.loading"
                class="btn btn-primary w-full"
              >
                {{ usersStore.loading ? "Adding..." : "Add Course" }}
              </button>
            </form>
            <div class="mt-6 space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="course in usersStore.courses"
                :key="course.id"
                class="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm"
              >
                <span
                  ><span class="font-bold text-primary-600 mr-2">{{ course.code }}</span>
                  {{ course.name }}
                  <span class="text-gray-400 text-xs"
                    >({{ course.department_name }})</span
                  ></span
                >
                <button
                  @click="handleDeleteCourse(course.id)"
                  class="text-red-500 hover:text-red-700 text-xs font-bold"
                >
                  Delete
                </button>
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
import { useMaterialsStore } from "../stores/materials";
import { useUsersStore } from "../stores/users";
import Sidebar from "../components/Sidebar.vue";

const materialsStore = useMaterialsStore();
const usersStore = useUsersStore();

const activeTab = ref("materials");
const showUpload = ref(false);
const uploading = ref(false);
const uploadError = ref("");

const showUserForm = ref(false);
const userError = ref("");
const userForm = ref({
  full_name: "",
  email: "",
  password: "",
  role: "student",
  matric_number: "",
  staff_id: "",
  department_id: "",
});

const uploadForm = ref({
  title: "",
  description: "",
  department_id: "",
  course_id: "",
  semester: "",
  file: null,
});
const deptForm = ref({ name: "", code: "" });
const courseForm = ref({ name: "", code: "", department_id: "" });

const filteredCourses = computed(() => {
  if (!uploadForm.value.department_id) return [];
  return usersStore.courses.filter(
    (c) => c.department_id == uploadForm.value.department_id
  );
});

async function loadUsersData() {
  if (usersStore.users.length === 0) await usersStore.fetchUsers();
  if (usersStore.departments.length === 0) await usersStore.fetchDepartments();
}

async function loadAuditLogs() {
  if (usersStore.auditLogs.length === 0) await usersStore.fetchAuditLogs();
}

async function loadCategoriesData() {
  if (usersStore.departments.length === 0) await usersStore.fetchDepartments();
  if (usersStore.courses.length === 0) await usersStore.fetchCourses();
}

onMounted(async () => {
  await Promise.all([
    materialsStore.fetchMaterials(),
    usersStore.fetchUsers(),
    usersStore.fetchDepartments(),
    usersStore.fetchCourses(),
  ]);
});

function handleFileChange(e) {
  uploadForm.value.file = e.target.files[0];
}

async function handleUpload() {
  uploadError.value = "";
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", uploadForm.value.file);
    formData.append("title", uploadForm.value.title);
    formData.append("description", uploadForm.value.description || "");
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
    uploadError.value = err.response?.data?.message || "Upload failed.";
  } finally {
    uploading.value = false;
  }
}

async function handleCreateUser() {
  userError.value = "";
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
    userError.value = err.response?.data?.message || "Failed to create user.";
  }
}

async function handleReject(id) {
  const reason = prompt("Enter rejection reason:");
  if (reason) await materialsStore.rejectMaterial(id, reason);
}

async function handleRoleChange(userId, newRole) {
  let extraIdentifiers = {};

  if (newRole === "student") {
    const matric = prompt(
      "This user is now a Student.\n\n" +
        "Please enter their Matriculation Number (e.g., 24/CSC/001):\n" +
        "(Leave blank to set as PENDING)"
    );
    if (matric === null) {
      await usersStore.fetchUsers();
      return;
    }
    extraIdentifiers.matric_number = matric.trim() === "" ? null : matric.trim();
  } else {
    const roleTitle = newRole === "lecturer" ? "Lecturer" : "Admin";
    const staffId = prompt(
      `This user is now a ${roleTitle}.\n\n` +
        "Please enter their Staff ID (e.g., STF/001):\n" +
        "(Leave blank to set as PENDING)"
    );
    if (staffId === null) {
      await usersStore.fetchUsers();
      return;
    }
    extraIdentifiers.staff_id = staffId.trim() === "" ? null : staffId.trim();
  }

  try {
    await usersStore.updateUserRole(userId, newRole, extraIdentifiers);
  } catch (err) {
    alert("Failed to update role.");
    await usersStore.fetchUsers();
  }
}

async function handleDeptChange(userId, deptId) {
  try {
    await usersStore.updateUserDepartment(userId, deptId);
  } catch (err) {
    alert("Failed to update department.");
    await usersStore.fetchUsers();
  }
}

async function handleAddDepartment() {
  try {
    await usersStore.addDepartment(deptForm.value);
    deptForm.value = { name: "", code: "" };
  } catch (err) {
    alert(err.response?.data?.message || "Failed to add department");
  }
}

async function handleDeleteDepartment(id) {
  if (confirm("Are you sure you want to delete this department?")) {
    try {
      await usersStore.deleteDepartment(id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete department");
    }
  }
}

async function handleAddCourse() {
  try {
    await usersStore.addCourse(courseForm.value);
    courseForm.value = { name: "", code: "", department_id: "" };
  } catch (err) {
    alert(err.response?.data?.message || "Failed to add course");
  }
}

async function handleDeleteCourse(id) {
  if (confirm("Are you sure you want to delete this course?")) {
    try {
      await usersStore.deleteCourse(id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
    }
  }
}
</script>
