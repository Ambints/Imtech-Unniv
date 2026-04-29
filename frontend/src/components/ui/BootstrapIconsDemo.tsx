import React from 'react';
import {
  Home,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Calendar,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  TrendingUp,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  MoreVertical
} from 'lucide-react';

/**
 * IMTECH University - Bootstrap 5 + Lucide React Icons Demo
 * 
 * This component demonstrates how to use Bootstrap 5 classes
 * with Lucide React icons throughout the application.
 */

const BootstrapIconsDemo: React.FC = () => {
  return (
    <div className="container-fluid py-5">
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="text-gradient mb-2">
            <BookOpen className="me-2" size={40} />
            Bootstrap 5 + Lucide React Icons
          </h1>
          <p className="text-muted">Examples of Bootstrap components with Lucide icons</p>
        </div>
      </div>

      {/* Buttons with Icons */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4">Buttons with Icons</h3>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary">
              <Plus size={18} className="me-2" />
              Add New
            </button>
            <button className="btn btn-success">
              <CheckCircle size={18} className="me-2" />
              Approve
            </button>
            <button className="btn btn-danger">
              <Trash2 size={18} className="me-2" />
              Delete
            </button>
            <button className="btn btn-warning">
              <Edit size={18} className="me-2" />
              Edit
            </button>
            <button className="btn btn-info">
              <Download size={18} className="me-2" />
              Download
            </button>
            <button className="btn btn-gradient-primary">
              <Upload size={18} className="me-2" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Cards with Icons */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4">Stat Cards</h3>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <Users size={24} className="text-primary" />
                </div>
                <TrendingUp size={20} className="text-success" />
              </div>
              <h6 className="text-muted mb-1">Total Students</h6>
              <h3 className="mb-0">2,543</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <BookOpen size={24} className="text-success" />
                </div>
                <TrendingUp size={20} className="text-success" />
              </div>
              <h6 className="text-muted mb-1">Active Courses</h6>
              <h3 className="mb-0">156</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <DollarSign size={24} className="text-warning" />
                </div>
                <TrendingUp size={20} className="text-success" />
              </div>
              <h6 className="text-muted mb-1">Revenue</h6>
              <h3 className="mb-0">$45.2K</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <Calendar size={24} className="text-info" />
                </div>
                <Clock size={20} className="text-muted" />
              </div>
              <h6 className="text-muted mb-1">Events Today</h6>
              <h3 className="mb-0">12</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts with Icons */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4">Alerts with Icons</h3>
        </div>
        <div className="col-md-6 mb-3">
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <CheckCircle size={20} className="me-2 flex-shrink-0" />
            <div>Operation completed successfully!</div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <XCircle size={20} className="me-2 flex-shrink-0" />
            <div>An error occurred. Please try again.</div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <AlertCircle size={20} className="me-2 flex-shrink-0" />
            <div>Warning: This action cannot be undone.</div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <Info size={20} className="me-2 flex-shrink-0" />
            <div>New updates are available.</div>
          </div>
        </div>
      </div>

      {/* Input Groups with Icons */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4">Input Groups with Icons</h3>
        </div>
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <input type="text" className="form-control" placeholder="Search..." />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <Mail size={18} />
            </span>
            <input type="email" className="form-control" placeholder="Email address" />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <Phone size={18} />
            </span>
            <input type="tel" className="form-control" placeholder="Phone number" />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <MapPin size={18} />
            </span>
            <input type="text" className="form-control" placeholder="Location" />
          </div>
        </div>
      </div>

      {/* Badges with Icons */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4">Badges with Icons</h3>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge bg-primary d-flex align-items-center gap-1">
              <CheckCircle size={14} />
              Active
            </span>
            <span className="badge bg-success d-flex align-items-center gap-1">
              <CheckCircle size={14} />
              Completed
            </span>
            <span className="badge bg-warning d-flex align-items-center gap-1">
              <Clock size={14} />
              Pending
            </span>
            <span className="badge bg-danger d-flex align-items-center gap-1">
              <XCircle size={14} />
              Cancelled
            </span>
            <span className="badge bg-info d-flex align-items-center gap-1">
              <Info size={14} />
              Info
            </span>
          </div>
        </div>
      </div>

      {/* List Group with Icons */}
      <div className="row mb-5">
        <div className="col-md-6">
          <h3 className="mb-4">Navigation List</h3>
          <div className="list-group">
            <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
              <Home size={18} className="me-3 text-primary" />
              Dashboard
            </a>
            <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
              <Users size={18} className="me-3 text-primary" />
              Students
            </a>
            <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
              <BookOpen size={18} className="me-3 text-primary" />
              Courses
            </a>
            <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
              <DollarSign size={18} className="me-3 text-primary" />
              Finance
            </a>
            <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
              <Settings size={18} className="me-3 text-primary" />
              Settings
            </a>
          </div>
        </div>
      </div>

      {/* Table with Icons */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4">Table with Action Icons</h3>
          <div className="card">
            <div className="card-body">
              <table className="table table-imtech table-hover">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Doe</td>
                    <td>john@example.com</td>
                    <td>
                      <span className="badge bg-success d-inline-flex align-items-center gap-1">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1">
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-warning me-1">
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>Jane Smith</td>
                    <td>jane@example.com</td>
                    <td>
                      <span className="badge bg-warning d-inline-flex align-items-center gap-1">
                        <Clock size={12} />
                        Pending
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1">
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-warning me-1">
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown with Icons */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4">Dropdown Menu with Icons</h3>
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <Menu size={18} className="me-2" />
              Actions
            </button>
            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <Plus size={16} className="me-2" />
                  Add New
                </a>
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <Edit size={16} className="me-2" />
                  Edit
                </a>
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <Download size={16} className="me-2" />
                  Download
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item d-flex align-items-center text-danger" href="#">
                  <Trash2 size={16} className="me-2" />
                  Delete
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootstrapIconsDemo;

// Made with Bob
