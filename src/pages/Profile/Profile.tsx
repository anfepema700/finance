import SidebarComponent from "../../components/Sidebar/SidebarComponent";
import { Avatar } from "primereact/avatar";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { FormAccessLogin } from "../Login/models/login.model";
import { useForm } from "react-hook-form";
import {
  getDataUserByIdService,
  saveDataUserService,
} from "./services/profile.service";
import { EditProfile } from "./models/Profile.model";
import { ProfileUserData } from "../HomeAdmin/components/AdminUsers/models/adminUsers.model";
import ToastBackControl from "../../components/Sidebar/ToastBackControl/ToastBackControl";
import { ToastControlBackendModel } from "../../components/Sidebar/ToastBackControl/models/toastBackControl.model";

function Profile(): JSX.Element {
  const idUser = localStorage.getItem("idUser");
  const [editShape, setEditShape] = useState<boolean>(true);
  const { handleSubmit } = useForm<FormAccessLogin>({ mode: "onChange" });
  const [dataProfile, setDataProfile] = useState<ProfileUserData>();
  const [name, setName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [phone, setPhone] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [messageBackend, setMessageBackend] =
    useState<ToastControlBackendModel>({
      severityValue: "info",
      detailValue: "",
      lifeValue: 3000,
      validateShowMessage: false,
    });
  const getDataProfile = async (): Promise<void> => {
    try {
      if (idUser) {
        const response = await getDataUserByIdService(+idUser);
        if (response.data) {
          setDataProfile(response.data);
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    getDataProfile();
    window.removeEventListener("beforeunload", localStorage.clear);
  }, []);
  const onSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      const dataUpdateProfile: EditProfile = {
        idUser: Number(idUser),
        name: name ? String(name) : String(dataProfile?.name),
        lastName: lastName ? String(lastName) : String(dataProfile?.lastName),
        phone: phone ? String(phone) : String(dataProfile?.phone),
      };
      const response = await saveDataUserService(dataUpdateProfile);
      if (response.statusCode < 299) {
        getDataProfile();
        setEditShape(true);
        setMessageBackend({
          severityValue: "success",
          detailValue: "Se ha actualizado el perfil",
          lifeValue: 3000,
          validateShowMessage: true,
        });
      }
    } catch (error) {
      setMessageBackend({
        severityValue: "error",
        detailValue: "Error al actualizar el perfil",
        lifeValue: 3000,
        validateShowMessage: true,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mt-8">
      <SidebarComponent />
      {messageBackend.validateShowMessage && (
        <ToastBackControl
          validateShowMessage={messageBackend.validateShowMessage}
          detailValue={messageBackend.detailValue}
          lifeValue={messageBackend.lifeValue}
          severityValue={messageBackend.severityValue}
        />
      )}
      {dataProfile && (
        <div className="grid text-center">
          <div className="col-12">
            <Avatar icon="pi pi-user" size="xlarge" shape="circle"></Avatar>
            <Badge
              value={`id: ${dataProfile?.idUser}`}
              style={{ right: "5vh" }}
            ></Badge>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="col">
                <label className="ml-3">Nombre: </label>
                <InputText
                  className="p-field"
                  disabled={editShape}
                  placeholder={dataProfile?.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                  }}
                ></InputText>
              </div>
              <div className="col">
                <label className="ml-3">Apellido: </label>
                <InputText
                  className="p-field"
                  disabled={editShape}
                  placeholder={dataProfile?.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setLastName(e.target.value);
                  }}
                ></InputText>
              </div>
              <div className="col-12">
                <label className="ml-3">Usuario: </label>
                <InputText
                  className="p-field"
                  disabled
                  placeholder={dataProfile?.user}
                ></InputText>
              </div>
              <div className="col-12">
                <label className="ml-3">Teléfono: </label>
                <InputText
                  disabled={editShape}
                  placeholder={dataProfile?.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPhone(e.target.value);
                  }}
                ></InputText>
              </div>
              {!editShape && (
                <div className="col-12">
                  <Button
                    label="Guardar"
                    onClick={() => {
                      onSubmit();
                      setEditShape(true);
                    }}
                  />
                </div>
              )}
            </form>
          </div>

          {editShape && (
            <div className="col-12">
              <Button
                label="Editar"
                onClick={() => setEditShape(false)}
                loading={loading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
