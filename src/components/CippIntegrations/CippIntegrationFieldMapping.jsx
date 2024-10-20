import { Box, Grid, CardContent, Typography } from "@mui/material";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import { useEffect } from "react";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";

const CippIntegrationFieldMapping = () => {
  const router = useRouter();

  const fieldMapping = ApiGetCall({
    url: "/api/ExecExtensionMapping",
    data: {
      List: `${router.query.id}Fields`,
    },
    queryKey: `IntegrationFieldMapping-${router.query.id}`,
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: fieldMapping?.data,
  });

  const extension = extensions.find((extension) => extension.id === router.query.id);

  useEffect(() => {
    if (fieldMapping.isSuccess) {
      formControl.reset({
        ...fieldMapping.data,
      });
      formControl.trigger();
    }
  }, [fieldMapping.isSuccess]);

  return (
    <>
      {fieldMapping.isSuccess && extension ? (
        <CippFormSection
          queryKey={`IntegrationFieldMapping-${router.query.id}`}
          formControl={formControl}
          title={extension.name}
          backButtonTitle="Integrations"
          postUrl={`/api/ExecExtensionMapping?AddMapping=${router.query.id}Fields`}
        >
          <>
            {fieldMapping?.data?.CIPPFieldHeaders?.map((header, index) => (
              <>
                <Typography key={index} variant="h4">
                  {header.Title}
                </Typography>
                <Typography key={index} variant="body2">
                  {header.Description}
                </Typography>
                <Grid container spacing={3}>
                  {fieldMapping?.data?.CIPPFields?.filter(
                    (field) => field.FieldType === header.FieldType
                  ).map((field, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Box sx={{ p: 1 }}>
                        <CippFormComponent
                          name={field.FieldName}
                          type="autoComplete"
                          label={field.FieldLabel}
                          options={fieldMapping?.data?.IntegrationFields?.filter(
                            (integrationField) =>
                              (integrationField?.type === field.Type &&
                                integrationField?.FieldType === field.FieldType) ||
                              integrationField?.type === undefined ||
                              integrationField?.FieldType === undefined
                          )?.map((integrationField) => {
                            return {
                              label: integrationField.name,
                              value: integrationField.value,
                            };
                          })}
                          value={
                            fieldMapping?.data?.Mappings?.filter(
                              (mapping) => mapping.RowKey === field.FieldName
                            ).map((mapping) => {
                              return {
                                label: fieldMapping?.data?.IntegrationFields.find(
                                  (integrationField) =>
                                    integrationField.value === mapping.IntegrationId
                                )?.name,
                                value: mapping.IntegrationId,
                              };
                            })[0]
                          }
                          formControl={formControl}
                          placeholder={field?.placeholder}
                          multiple={false}
                          fullWidth
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            ))}
          </>
        </CippFormSection>
      ) : (
        <CardContent>
          {fieldMapping.isLoading && <Box>Loading...</Box>}
          {fieldMapping.isSuccess && !extension && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ textAlign: "center" }}>Extension not found</Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      )}
    </>
  );
};

export default CippIntegrationFieldMapping;
