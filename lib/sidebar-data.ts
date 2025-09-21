import {
  IconUsers,
  IconTruck,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconUserPlus,
} from "@tabler/icons-react"

export const sidebarData = {
  user: {
    name: "Admin User",
    email: "admin@zorluholding.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Employees",
      url: "#",
      icon: IconUsers,
      key: "employees",
      subItems: [
        {
          title: "Add Employee",
          url: "#",
          key: "add-employee",
          icon: IconUserPlus,
        },
      ],
    },
    {
      title: "Shuttles",
      url: "#",
      icon: IconTruck,
      key: "Shuttles",
    },
    {
      title: "Optimization",
      url: "#",
      icon: IconChartBar,
      key: "optimization",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
<<<<<<< HEAD
}


=======
}
>>>>>>> b798db6 (pickup points 1)
